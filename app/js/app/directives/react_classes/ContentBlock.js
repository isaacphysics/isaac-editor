define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, typeMap, Block, TabsBlock, AccordionBlock, ContentValueOrChildren) {
		var ContentBlock = React.createClass({

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

			render: function() {
				if (typeMap[this.props.doc.type] != ContentBlock) {
					return <div className="block type-unknown">[Block of unknown content type: '{this.props.doc.type}']</div>;
				}

				if (this.props.doc.layout == "tabs") {
					return (
						<TabsBlock doc={this.props.doc} onChange={this.onDocChange}/>
					);
				}

				if (this.props.doc.layout == "accordion") {
					return (
						<AccordionBlock doc={this.props.doc} onChange={this.onDocChange}/>
					);
				}

				if (this.props.doc.type !== "isaacWildcard") {
					var children = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>;
				}

				return (
					<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
						{children}
					</Block>
				);
			}
		});

		return ContentBlock;
	}
})
