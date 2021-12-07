define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, ContentValueOrChildren) {
        return React.createClass({

            getInitialState: function() {
                return {
                    tabOverride: function(e) {
                        if (e.key == 'Tab') {
                            e.preventDefault();
                            var start = this.selectionStart;
                            var end = this.selectionEnd;

                            // set textarea value to: text before caret + tab + text after caret
                            this.value = this.value.substring(0, start) +
                                "\t" + this.value.substring(end);

                            // put caret at right position again
                            this.selectionStart =
                                this.selectionEnd = start + 1;
                        }
                    },
                    uid: (Math.floor(Math.random() * 99999999)).toString()
                };
            },

            componentDidMount: function() {
                document.getElementById('setup-code-textbox' + this.state.uid).addEventListener('keydown', this.state.tabOverride);
                document.getElementById('code-textbox' + this.state.uid).addEventListener('keydown', this.state.tabOverride);
                document.getElementById('test-code-textbox' + this.state.uid).addEventListener('keydown', this.state.tabOverride);
            },

            componentWillUnmount: function() {
                document.getElementById('setup-code-textbox' + this.state.uid).removeEventListener('keydown', this.state.tabOverride);
                document.getElementById('code-textbox' + this.state.uid).removeEventListener('keydown', this.state.tabOverride);
                document.getElementById('test-code-textbox' + this.state.uid).removeEventListener('keydown', this.state.tabOverride);
            },

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onCheckboxChange: function(key, e) {
                console.log("New checkbox state:", e.target.checked, "for key:", key);

                // newVal must be a doc
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc[key] = e.target.checked;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onSetupCodeChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.setupCode = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onCodeChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.code = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onTestCodeChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.testCode = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onTestInputChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.testInput = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onLanguageStyleChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.language = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onExpectedResultChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.expectedResult = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onOutputRegexChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.outputRegex = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            onUrlChange: function(e) {
                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.url = e.target.value;
                this.onDocChange(this, oldDoc, newDoc);
            },

            regexHelper: function(_e) {
                var regex = this.props.doc.outputRegex || ""
                window.open(`https://regex101.com/?regex=${encodeURIComponent(regex)}&delimiter=%22&flavor=javascript&flags=`)
            },

            render: function() {

                let title;
                let type;
                if (this.props.doc.type === "interactiveCodeSnippet") {
                    title = "InteractiveCodeSnippet";
                    type = "interactiveCodeSnippet";
                } else {
                    title = "CodeSnippet";
                    type = "codeSnippet";
                }

                const languageSelect = {
                    "codeSnippet": <div>
                            <label>Language Style:</label>
                            <select value={this.props.doc.language} onChange={this.onLanguageStyleChange}>
                                <option value="python">Python</option>
                                <option value="javascript">Javascript</option>
                                <option value="csharp">C#</option>
                                <option value="php">PHP</option>
                                <option value="sql">SQL</option>
                                <option value="pseudocode">Isaac Pseudocode</option>
                            </select>
                        </div>,
                    "interactiveCodeSnippet": <div>
                            <label>Language:</label>
                            <select value={this.props.doc.language} onChange={this.onLanguageStyleChange}>
                                <option value="python">Python</option>
                            </select>
                        </div>
                }[type];

                return (
                    <Block type={type} blockTypeTitle={title} doc={this.props.doc} onChange={this.onDocChange}>
                        {languageSelect}
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}} ref="disableHighlightingCheckbox">
                            <label><input type="checkbox" checked={this.props.doc.disableHighlighting} onChange={this.onCheckboxChange.bind(this, "disableHighlighting")} /> Disable Highlighting</label>
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}}>
                            <label>Setup code:</label>
                            <textarea id={"setup-code-textbox" + this.state.uid} className={"code-textbox"} value={this.props.doc.setupCode || ''} rows="10" onChange={this.onSetupCodeChange}/>
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}} ref="wrapCodeInMainCheckbox">
                            <label><input type="checkbox" checked={this.props.doc.wrapCodeInMain} onChange={this.onCheckboxChange.bind(this, "wrapCodeInMain")} /> Wrap the users code in a main function</label>
                        </div>
                        <div>
                            <label>Code:</label>
                            <textarea id={"code-textbox" + this.state.uid} className={"code-textbox"} value={this.props.doc.code || ''} rows="10" onChange={this.onCodeChange}/>
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}}>
                            <label>Test code:</label>
                            <textarea id={"test-code-textbox" + this.state.uid} className={"code-textbox"} value={this.props.doc.testCode || ''} rows="10" onChange={this.onTestCodeChange}/>
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}} ref="useAllTestInputsCheckbox">
                            <label><input type="checkbox" checked={this.props.doc.useAllTestInputs} onChange={this.onCheckboxChange.bind(this, "useAllTestInputs")} /> All test inputs must be consumed</label>
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}}>
                            <label>Test inputs:</label>
                            <textarea style={{fontFamily: "monospace"}} value={this.props.doc.testInput} onChange={this.onTestInputChange} placeholder="Newline-separated test inputs" />
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}}>
                            <label>Expected test result:</label>
                            <input type="text" style={{fontFamily: "monospace"}} value={this.props.doc.expectedResult} onChange={this.onExpectedResultChange} placeholder="Expected result" />
                        </div>
                        <div style={{display: this.props.doc.type === "interactiveCodeSnippet" ? "block" : "none"}}>
                            <label>Output regex:</label>
                            <input type="text" style={{fontFamily: "monospace"}} value={this.props.doc.outputRegex} onChange={this.onOutputRegexChange} placeholder="Regex to test printed output" />
                            <button className="button tiny tag radius" onClick={this.regexHelper}>Test Regex</button>
                        </div>
                        <div>
                            <label>Url of code:</label>
                            <input type="text" value={this.props.doc.url} onChange={this.onUrlChange} placeholder="Url" />
                        </div>
                    </Block>
                );
            }
        });
    }
})
