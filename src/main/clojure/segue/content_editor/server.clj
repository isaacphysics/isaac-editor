(ns segue.content-editor.server
  (:use compojure.core)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [ring.util.response :as response]
            [clojure.java.shell :as sh]
            [clojure.data.codec.base64 :as b64]
            [clojure.java.io :as io]))
            
(defn slurp-binary-file [file]
  (io! (with-open [reader (io/input-stream file)]
         (let [buffer (byte-array (.length file))]
           (.read reader buffer)
           buffer))))
           
(defn compile-file [file]
  (println "Compiling" (:path file))
  
  ;; Update the repo
  (println (:out (sh/sh "C:/Users/ipd21/AppData/Local/Atlassian/SourceTree/git_local/bin/git.exe" "reset --hard" :dir "c:/dev/rutherford/rutherford-content")))
  ;;(println (:out (sh/sh "C:/Users/ipd21/AppData/Local/Atlassian/SourceTree/git_local/bin/git.exe" "pull" :dir "c:/dev/rutherford/rutherford-content")))
  
  (spit (str "c:/dev/rutherford/rutherford-content/" (:path file)) (:editedContent file) :append false)
  
  ;; Compile that file
  (println (:err (sh/sh "C:/Python27/python.exe" "c:/dev/rutherford/rutherford-content/src/main/python/makePDF.py" 
               (str "c:/dev/rutherford/rutherford-content/" (:path file)) 
               (str "c:/tmp/" (:name file) ".pdf")
               "--workingDir"
               "c:/tmp/pdfWorking/foo/bar")))
  (println "Done")
  (String. (b64/encode (slurp-binary-file (io/file (str "c:/tmp/" (:name file) ".pdf")))))
  )
            
(defroutes app-routes
  (GET "/" [] (response/redirect "index.html"))
  (POST "/api/compile" req (compile-file (:file (:params req))))
  (route/resources "/" {:root ""})
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))