define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		return React.createClass({
			render: function() {
				if (this.props.disabled)
					return <div  />;

				return this.transferPropsTo(
					<div className="op-delete">
						<i className="general foundicon-remove"/>
					</div>
				);

			}
		});
	}
})
