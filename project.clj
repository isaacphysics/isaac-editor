(defproject segue.content-editor "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [compojure "1.1.6"]
                 [org.clojure/data.codec "0.1.0"]]
  :ring {:handler segue.content-editor.server/app
         :port 8080}
  :source-paths ["src/main/clojure"]
  :resource-paths ["src/main/webapp"]
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
