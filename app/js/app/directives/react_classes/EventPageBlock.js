define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, FigureBlock, ContentValueOrChildren) {
		return React.createClass({

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onContentChange: function(c, oldVal, newVal, oldChildren, newChildren) {
				// newVal could be a string or a list.
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.value = newVal;
				newDoc.children = newChildren;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onThumbnailChange: function(c, oldVal, newVal) {
				//console.log("onThumbnailChange", newVal);
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.eventThumbnail = newVal;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onLocationClick: function() {
				this.refs.blk.onMdClick();
			},

			render: function() {

				if (this.props.doc.location) {
					var loc = [<div style={{color: "#aaa"}} onClick={this.onLocationClick}><br/>
						{this.props.doc.location.address.addressLine1}, {this.props.doc.location.address.county}
					</div>,<br/>];
				}
				return (
					<Block ref="blk" type="eventPage" blockTypeTitle="Event Page" doc={this.props.doc} onChange={this.onDocChange}>
						{loc}
						<FigureBlock doc={this.props.doc.eventThumbnail} onChange={this.onThumbnailChange} />
						<ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
					</Block>
				);
			}
		});
	}
})
