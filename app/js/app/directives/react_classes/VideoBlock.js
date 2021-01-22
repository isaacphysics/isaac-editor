define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, ContentValueOrChildren) {
		return React.createClass({

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onAltTextChange: function(c, oldVal, newVal, oldChildren, newChildren) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.altText = newVal;
				newDoc.children = newChildren;

				this.onDocChange(this, oldDoc, newDoc);
			},

			render: function() {

				var optionalAltText = <ContentValueOrChildren value={this.props.doc.altText} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onAltTextChange}/>;

				return (
					<Block type="video" blockTypeTitle="Video" doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="small-6 columns text-center">
								Video src: {this.props.doc.src}
							</div>
							<div className="small-6 columns">
								{optionalAltText}
							</div>
						</div>
					</Block>
				);
			}
		});
	}
})
