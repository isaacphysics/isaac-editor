define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, typeMap, UnknownBlock) {
		return React.createClass({
			render: function() {
				if (this.props.doc.type)
					var DocClass = typeMap[this.props.doc.type];
				else
					var DocClass = UnknownBlock;
				return this.transferPropsTo(DocClass ? DocClass() : <Block blockTypeTitle={"Unknown content type: " + this.props.doc.type} />);
			}
		});
	}
})
