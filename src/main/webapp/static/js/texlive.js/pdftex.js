var PDFTeX = function () {
    var worker = new Worker("/static/js/texlive.js/pdftex-worker.js");
    var self = this;
    var initialized = false;
    var stdOutCallback = null;
    var stdErrCallback = null;

    self.on_filenotfound = function (file) {
        console.error("FILE NOT FOUND:", file);

        // Interrupt running:
        worker.onmessage(JSON.stringify({ command: "die" }))
    }

    self.on_stdout = function (msg) {
        console.log(msg);
        if (stdOutCallback)
            stdOutCallback(msg);

        var p = /!.*File `(.*)' not found/i
        var m = p.exec(msg);
        if (m) {
            self.on_filenotfound(m[1]);
        }
    }

    self.on_stderr = function (msg) {
        console.error(msg);
        if (stdErrCallback)
            stdErrCallback(msg);
    }

    var onReady = new RSVP.defer();

    worker.onmessage = function (ev) {
        var data = JSON.parse(ev.data);
        var msg_id;

        if (!('command' in data))
            console.log("missing command!", data);
        switch (data['command']) {
            case 'ready':
                onReady.resolve(true);
                break;
            case 'stdout':
            case 'stderr':
                self['on_' + data['command']](data['contents']);
                break;
            case 'die':
                console.error("DIE");
                self.close();
                break;
            default:
                //console.debug('< received', ev.data);
                msg_id = data['msg_id'];
                if (('msg_id' in data) && (msg_id in promises)) {
                    promises[msg_id].resolve(data['result']);
                }
                else
                    console.warn('Unknown worker message ' + msg_id + '!');
        }
    }

    var promises = [];
    var chunkSize = undefined;

    var sendCommand = function (cmd) {
        var p = new RSVP.defer();
        var msg_id = promises.push(p) - 1;

        onReady.promise.then(function () {
            cmd['msg_id'] = msg_id;
            //console.debug('> sending', cmd);
            worker.postMessage(JSON.stringify(cmd));
        });

        return p.promise;
    };

    var determineChunkSize = function () {
        var size = 1024;
        var max = undefined;
        var min = undefined;
        var delta = size;
        var success = true;
        var buf;

        while (Math.abs(delta) > 100) {
            if (success) {
                min = size;
                if (typeof (max) === 'undefined')
                    delta = size;
                else
                    delta = (max - size) / 2;
            }
            else {
                max = size;
                if (typeof (min) === 'undefined')
                    delta = -1 * size / 2;
                else
                    delta = -1 * (size - min) / 2;
            }
            size += delta;

            success = true;
            try {
                buf = String.fromCharCode.apply(null, new Uint8Array(size));
                sendCommand({
                    command: 'test',
                    data: buf,
                });
            }
            catch (e) {
                success = false;
            }
        }

        return size;
    };


    var createCommand = function (command) {
        self[command] = function () {
            var args = [].concat.apply([], arguments);

            return sendCommand({
                'command': command,
                'arguments': args,
            });
        }
    }
    createCommand('FS_createDataFile'); // parentPath, filename, data, canRead, canWrite
    createCommand('FS_readFile'); // filename
    createCommand('FS_unlink'); // filename
    createCommand('FS_chdir'); // path
    createCommand('FS_createFolder'); // parent, name, canRead, canWrite
    createCommand('FS_createPath'); // parent, name, canRead, canWrite
    createCommand('FS_createLazyFile'); // parent, name, canRead, canWrite
    createCommand('FS_createLazyFilesFromList'); // parent, list, parent_url, canRead, canWrite

    var curry = function (obj, fn, args) {
        return function () {
            return obj[fn].apply(obj, args);
        }
    }

    var extraFolderCommands = [];
    var extraFileCommands = [];

    self.addExtraFolder = function (path) {
        extraFolderCommands.push(curry(self, 'FS_createPath', ['/resources', path, true, true]));
    }
    self.addExtraLazyFile = function (path, url, length) {
        extraFileCommands.push(curry(self, 'FS_createLazyFile', ['/resources', path, url, true, false, length]));
    }
    self.addExtraFile = function (path, content) {
        extraFileCommands.push(curry(self, 'FS_createDataFile', ['/resources', path, content, true, true]));
    }

    function initFS(inputTex) {
        commands = [
          curry(self, 'FS_createFolder', ['/', 'bin', true, true]),
          curry(self, 'FS_createFolder', ['/', 'resources', true, true]),
          curry(self, 'FS_createDataFile', ['/bin', 'this.program', '', true, true]),
          curry(self, 'FS_createDataFile', ['/resources', 'input.tex', inputTex, true, true]),
          curry(self, 'FS_createLazyFile', ['/resources', 'latex.fmt', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/latex.fmt', true, true]),
          curry(self, 'FS_createFolder', ['/bin/', 'share', true, true]),
          curry(self, 'FS_createLazyFile', ['/bin/', 'texmf.cnf', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/texlive/texmf-dist/web2c/texmf.cnf', true, true]),
          curry(self, 'FS_createLazyFilesFromList', ['/', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/texlive.lst', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/texlive/', true, true]),
          curry(self, 'FS_chdir', ['/resources']),
        ];

        var allCommands = commands.concat(extraFolderCommands).concat(extraFileCommands);
        var ps = [];
        for (var c in allCommands) {
            var f = allCommands[c];
            ps.push(f());
        }
        return RSVP.all(ps);
    }

    self.terminate = function () {
        promises[promises.length - 1].reject("Cancelled");
        worker.terminate();
    }

    self.compile = function (source_code, stdOut, stdErr) {
        stdOutCallback = stdOut;
        stdErrCallback = stdErr;
        return self.compileRaw(source_code).then(function (files) {
            if (files.pdf === false)
                throw new Error("No PDF Produced");

            files.pdf_dataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(files.pdf);

            return files;
        });
    }

    self.compileRaw = function (source_code) {
        if (typeof (chunkSize) === "undefined")
            chunkSize = determineChunkSize();

        var commands;
        if (initialized)
            commands = [
              curry(self, 'FS_unlink', ['/input.tex']),
            ];
        else
            commands = [
              curry(self, 'FS_createFolder', ['/', 'bin', true, true]),
              curry(self, 'FS_createFolder', ['/', 'resources', true, true]),
              curry(self, 'FS_createDataFile', ['/bin', 'this.program', '', true, true]),
              curry(self, 'FS_createDataFile', ['/resources', 'input.tex', source_code, true, true]),
              curry(self, 'FS_createLazyFile', ['/resources', 'latex.fmt', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/latex.fmt', true, true]),
              curry(self, 'FS_createFolder', ['/bin/', 'share', true, true]),
              curry(self, 'FS_createLazyFile', ['/bin/', 'texmf.cnf', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/texlive/texmf-dist/web2c/texmf.cnf', true, true]),
              curry(self, 'FS_createLazyFilesFromList', ['/', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/texlive.lst', 'http://www.cl.cam.ac.uk/~ipd21/texlive_cdn/texlive/', true, true]),

              curry(self, 'FS_chdir', ['/resources']),
            ];

        var sendCompile = function () {
            initialized = true;
            return sendCommand({
                'command': 'run',
                'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', '&latex', 'input.tex'],
                //        'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
            });
        };

        var getPDF = function () {
            return self.FS_readFile('input.pdf');
        }

        var allCommands = commands.concat(extraFolderCommands).concat(extraFileCommands);
        var ps = [];
        for (var c in allCommands) {
            var f = allCommands[c];
            ps.push(f());
        }
        return RSVP.all(ps)
          .then(sendCompile)
          .then(function () {
              return RSVP.hash({
                  pdf: self.FS_readFile('input.pdf'),
                  aux: self.FS_readFile('input.aux'),
              });
          });
    };
};
