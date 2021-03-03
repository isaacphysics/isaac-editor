define(["react", "jquery"], function(React,$) {
    return function(ContentEditor, Block, VariantBlock, ContentValueOrChildren) {
        return React.createClass({

            onDocChange: function(c, oldDoc, newDoc) {
                this.props.onChange(this, oldDoc, newDoc);
            },

            onCodeChange: function(c, oldCodeDoc, newCodeDoc) {

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, oldDoc);
                newDoc.code = newCodeDoc;

                this.onDocChange(this, oldDoc, newDoc);
            },

            onPythonUrlChange: function(e) {

                this.setState({
                    pythonUrl: e.target.value
                });

                var oldDoc = this.props.doc;
                var newDoc = $.extend({}, this.props.doc);
                newDoc.pythonUrl = e.target.value;

                this.onDocChange(this, oldDoc, newDoc);
            },

            render: function() {
                return (
                    <Block type="code" blockTypeTitle="Code" doc={this.props.doc} onChange={this.onDocChange}>
                        <div className='row mb-3'>
                            <div className="large-12 columns">
                                <VariantBlock blockTypeTitle="Code" doc={this.props.doc.code} onChange={this.onCodeChange}/>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="small-1 columns text-left">
                                Python:
                            </div>
                            <div className="small-8 columns text-left">
                                <input type="text" placeholder="Enter Python url" value={this.props.doc.pythonUrl} onChange={this.onPythonUrlChange} />
                            </div>
                        </div>
                    </Block>
                );
            }
        });
    }
})
