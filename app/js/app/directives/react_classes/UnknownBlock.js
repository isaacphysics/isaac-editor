define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block) {
		return React.createClass({

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			chooseQuestion: function(e) {
				var type = $(e.target).data("chosenType");

				ContentEditor.snippetLoader.loadQuestionTemplate(type).then(function(t) {

					var newDoc = $.extend({}, this.props.doc, t);
					this.props.onChange(this, this.props.doc, newDoc);

				}.bind(this)).catch(function(e) {
					console.error("Unable to load question template of type", type, e);
				});
			},

			chooseType: function(e) {

				var type = $(e.target).data("chosenType");

				ContentEditor.snippetLoader.loadContentTemplate(type).then(function(t) {

					var newDoc = $.extend({}, t);
					this.props.onChange(this, this.props.doc, newDoc);

				}.bind(this)).catch(function(e) {
					console.error("Unable to load content template of type", type, e);
				});
			},

			render: function() {
				return (
					<Block type="unknown" blockTypeTitle="?" doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row">
							<div className="large-8 large-offset-2 columns text-center">
								Please choose a block type: <br/>
								<a onClick={this.chooseType} data-chosen-type="content">content</a>&nbsp; | &nbsp;
								<a onClick={this.chooseType} data-chosen-type="code">code</a>&nbsp; | &nbsp;
								<a onClick={this.chooseQuestion} data-chosen-type="isaacQuestion">question</a>&nbsp; | &nbsp;
								<a onClick={this.chooseType} data-chosen-type="glossaryTerm">glossary term</a>&nbsp; | &nbsp;
								<a onClick={this.chooseType} data-chosen-type="figure">figure</a>&nbsp; | &nbsp;
								<a onClick={this.chooseType} data-chosen-type="video">video</a>&nbsp; | &nbsp;
								<a onClick={this.chooseType} data-chosen-type="tabs">tabs</a>&nbsp; | &nbsp;
								<a onClick={this.chooseType} data-chosen-type="accordion">accordion</a>
							</div>
						</div>
					</Block>
				);
			}
		});
	}
})
