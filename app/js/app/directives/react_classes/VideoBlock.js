define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, ContentValueOrChildren) {
		return React.createClass({

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onAltTextChange: function(e) {

				this.setState({
					altText: e.target.value
				});

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.altText = e.target.value;

				this.onDocChange(this, oldDoc, newDoc);
			},

			render: function() {

				return (
					<Block type="video" blockTypeTitle="Video" doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="small-4 columns text-center">
								Video src: {this.props.doc.src}
							</div>
							<div className="small-3 columns text-right">
								Alt Text:
							</div>
							<div className="small-5 columns">
								<input type="text" placeholder="Enter alt text" value={this.props.doc.altText} onChange={this.onAltTextChange} />
							</div>
						</div>
					</Block>
				);
			}
		});
	}
})
