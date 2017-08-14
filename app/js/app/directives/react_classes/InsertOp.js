define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		return React.createClass({
			render: function() {
				if (this.props.disabled)
					return <div  />;

				return this.transferPropsTo(
					<div style={{position: "absolute"}} className="op-insert text-center" onClick={null} onMouseEnter={null} onMouseLeave={null}>
						<i className="general foundicon-plus" onClick={this.props.onClick} onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} />
					</div>
				);

			}
		});
	}
})
