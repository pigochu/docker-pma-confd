import Dockerode from "dockerode";
import * as fs from 'fs/promises';


const confdVolumePath = "/app/conf.d";

async function saveRunngingContainers(docker:Dockerode) {
  const containers = await docker.listContainers({
      "filters": {
          "status": ["running"] ,
          "label" : ["pma.allow_config=true"]
      }
  });

  console.log(`Found ${containers.length} running containers.`);

  let cfgString = "<?php\n";

  for(let i=0 ;i<containers.length; i++) {
    let container = containers[i];
    let cfgHasHost = false;

    cfgString += "$i++\n";
    for(let k in container.Labels) {
      // match pma.cfg.*
      const regex = /pma\.cfg\.(\w+)=/;
      const matches = k.match(regex);
      if(matches !== null && matches.length === 2) {
        const cfgKey = matches[1];
        const cfgVal = container.Labels[k];
        cfgString += `$cfg['Servers'][$i]['${cfgKey}']='${cfgVal}';\n`;

        if(cfgKey === 'pma.cfg.host') {
          cfgHasHost = true;
        }
      }
    }
    if(cfgHasHost === false) {
      cfgString += `$cfg['Servers'][$i]['host']='${container.Id}';\n`;
    }
  }
  const configFile = confdVolumePath + "/_pma_confd.php";
  await fs.writeFile(configFile , cfgString);
  console.log(`All configurations has been written to ${configFile} .`);
}



async function main() {

  let dockerSocketPath = process.env["DOCKER_SOCKET_PATH"] ?? "/var/run/docker.sock";

  
  try {
    const stats = await fs.stat(confdVolumePath);
  } catch (error) {
    console.error(`Directory ${confdVolumePath} does not exist , you need create the volume , please read the guide from https://github.com/pigochu/docker-pma-confd/blob/main/README.md`);
  }


  const docker = new Dockerode({
    socketPath: dockerSocketPath
  });

  await saveRunngingContainers(docker);


  const eventsOptions: Dockerode.GetEventsOptions = {
    filters: {
      type: ["container"],
      // event: ["start", "die", "stop", "kill", "pause"],
      event: ["start","stop"],
      label: ["pma.allow_config=true"],
    }
  };

  try {
    // Get realtime events stream
    const stream = await docker.getEvents(eventsOptions);

    stream.on("data", function (chunk) {
      const event = JSON.parse(chunk.toString('utf-8'));
      console.info("Event : " , event);
      saveRunngingContainers(docker);
      
    });

  } catch (e) {
    console.error(e);
    throw (e);
  }
  console.log('pma confd started.')
}

main();
