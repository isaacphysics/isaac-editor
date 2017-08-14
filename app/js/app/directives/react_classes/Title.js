define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		return React.createClass({
			render: function() {
				if (this.props.title)
					return (
						<div className="title-container" onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} onClick={this.props.onClick}>
							<div className="title-content">{this.props.title}</div>
							<div className="title-triangle"></div>
						</div>
					);
				else
					return <div className="title-placeholder"/>;
			}
		});
	}
})
