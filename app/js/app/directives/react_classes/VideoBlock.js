define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, ContentValueOrChildren) {
		return React.createClass({

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onCaptionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.value = newVal;
				newDoc.children = newChildren;

				this.onDocChange(this, oldDoc, newDoc);
			},

			render: function() {

				var optionalCaption = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

				return (
					<Block type="video" blockTypeTitle="Video" doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="small-6 columns text-center">
								Video src: {this.props.doc.src}
							</div>
							<div className="small-6 columns">
								{optionalCaption}
							</div>
						</div>
					</Block>
				);
			}
		});
	}
})
