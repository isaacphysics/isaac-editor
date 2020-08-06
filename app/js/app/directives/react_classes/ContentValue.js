define(["react", "jquery"], function(React,$) {
	return function(ContentEditor) {
		return React.createClass({
			getInitialState: function() {
				return { mode: "render" };
			},

			switchToEdit: function(_e) {

				var hasDefault = (/^_Enter .* Here_$/i).test(this.props.value);

				this.setState({
					mode: "edit",
					editedValue: hasDefault ? "" : this.props.value
				});
			},

			onDone: function(_e) {

				$(this.getDOMNode()).find(".CodeMirror").remove();

				// Could do some validation here.
				var oldValue = this.props.value;
				var newValue = this.state.editedValue;

				this.props.onChange(this, oldValue, newValue);

				this.setState({mode: "render"});
			},

			onValueChange: function(e) {
				this.setState({editedValue: e.target.value})
			},

			componentDidUpdate: function(_prevProps, prevState) {
				if (this.state.mode == "edit" && prevState.mode != "edit") {
					var cm = app.cm = CodeMirror(this.refs.placeholder.getDOMNode(),
						{mode: "",
						 theme: "eclipse",//"solarized light",
						 lineNumbers: false,
						 value: this.state.editedValue,
						 lineWrapping: true,
						 autofocus: true});

					cm.setCursor(9999,9999);

					$("body").scrollTop($(this.refs.placeholder.getDOMNode()).offset().top + $(this.refs.placeholder.getDOMNode()).height() - $(window).height() / 2);

					cm.on("change", (function(inst, _changeObj) {
						this.setState({editedValue: inst.getValue()});
					}).bind(this));
				}
				MathJax.resetLabels();

				if (ContentEditor.enableMathJax && this.refs.contentRow)
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.contentRow.getDOMNode()]);

			},

			componentDidMount: function() {
				if (ContentEditor.enableMathJax && this.refs.contentRow)
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.contentRow.getDOMNode()]);
			},

			render: function() {
				switch (this.state.mode)
				{
				case "render":

					var renderer = <div onClick={this.switchToEdit} className="content-value"/>;
					switch (this.props.encoding) {
						case "html":
							renderer.props.dangerouslySetInnerHTML = {__html: this.props.value};
							break;
						case "markdown":
							var converter = new remarkable.Remarkable({
								linkify: true,
								html: true,
							});
							var html = converter.render(this.props.value);
							renderer.props.dangerouslySetInnerHTML = {__html: html};
							break;
						case "plain":
							renderer.props.children = this.props.value;
							break;
						default:
							renderer.props.children = "<" + this.props.encoding + "> " + this.props.value;
							break;
					}

					return (
						<div className="row" ref="contentRow">
							<div className="large-12 columns">
								{renderer}
							</div>
						</div>
					);
				case "edit":
					return (
						<div>
							<div className="row">
								<div className="small-1 small-offset-6 columns text-right">
									ID:
								</div>
								<div className="small-5 columns">
									<input type="text" value={this.props.id} />
								</div>
							</div>
							<button type="button" onClick={this.onDone}>Done</button>
							<div ref="placeholder" />
							<button type="button" onClick={this.onDone}>Done</button>
						</div>
					);
				}
			}
		});
	}
})
