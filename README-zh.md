# Docker phpMyAdmin confd

本專案前身為 docker-phpmyadmin-autoconfig 的改良版，由於我建議了官方 phpMyAdmin 能夠添加 conf.d 的方式來進行額外設定，所以才有了這個專案。

這個專案是以 node + dockerode 來實作，目的是為了讓本地端的 phpMyAdmin 能更方便使用，主要的功能如下 :

1. 透過添加環境變數於 container 中達成自動生成設定檔至 phpMyAdmin 的 `/etc/phpMyAdmin/conf.d`
2. 不同於前身的專案是將 phpMyAdmin 包在一起，若我沒更新則版本一直是舊的，而此專案的運作方式是獨立的，因此可以搭配未來任何新版本的 phpMyAdmin。

> 請注意
>
> 本專案僅是為了開發者方便使用，不建議部屬至 Production 環境。

# 如何使用

我們使用 [samples/](samples/) 來講解設定的步驟。

在 samples 目錄中有以下三個子目錄分別作用是

1. phpmyadmin : 這裡頭包含了啟動 `phpMyAdmin` 及 `pma-confd` 的 compose 設定。
2. app1 及 app2 : 用以模擬兩個 app 並且都使用到 MariaDB 的設定。

在這個範例中，我們希望能用一套 phpMyAdmin 來管理 app1 及 app2 中的 MariaDB，先來看看 phpmyadmin 中的 `docker-compose.yml` 做了甚麼。

1. 我們可以看到 volumes 的設定，這是為了讓 `phpmyadmin` 與 `pma-confd` 能夠共享同一個 `conf.d`，當 `pma-confd` 發現到有 MariaDB 正在運作時，則會自動生成設定檔於其中。
2. 在 `pma-confd` 中必須將本地端的 docker socket path 綁定，以使其能監聽Docker 的事件，藉由事件能得知是否有 MariaDB 正在運作。

接著來看看 app1 及 app2 的設定

1. 在 lables 中必須要有一行 `pma.allow_config=true`，這是必須的，這是為了允許 `pma-confd` 對其做出對應的設定。
2. 在 labels 中有以 `pma.cfg` 開頭的設定，這會讓 `pma-confd` 知道要產生甚麼設定值，例如 `pma.cfg.verbose` 則是會生成 `$cfg['Servers'][$i]['verbose']`。


經過以上設定之後，就只需要一個 phpMyAdmin container 就可以操控 app1 及 app2 的 MariaDB。

如果要運作這個範例，分別於各目錄執行 `docker compose up -d` 就可以了。

接著只要打開 http://localhost:8080 就能發現有兩套 MariaDB 於登入畫面可以選擇。





