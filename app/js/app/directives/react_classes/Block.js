define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, typeMap, MetaData, Title, JSONEditor) {

		var displayMetadataForTypes = ["page", "isaacPod", "isaacCard", "emailTemplate", "isaacQuestionPage", "isaacFastTrackQuestionPage", "isaacConceptPage", "isaacTopicSummaryPage", "isaacWildcard", "figure", "isaacEventPage", "isaacPageFragment", "anvilApp"];

		return React.createClass({

			getDefaultProps: function() {
				return {
					blockTypeTitle: "",
					onChange: (function() { console.warn("Called undefined onChange function of block", this.props.doc); }).bind(this)
				};
			},

			getInitialState: function() {
				return {
					mode: "render"
				}
			},

			onMouseEnter: function() {
				$(this.refs.block.getDOMNode()).addClass("highlight");
			},

			onMouseLeave: function() {
				$(this.refs.block.getDOMNode()).removeClass("highlight");
			},

			onClick: function() {
				if (this.props.doc) {
					if (this.state.mode == "render")
						this.setState({mode: "json"});
				}
			},

			onEditDone: function(c, oldDoc, newDoc) {
				this.setState({mode: "render"});
				this.props.onChange(this, oldDoc, newDoc);
			},

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			onMdClick: function() {
				this.refs.md.toggleMetaData_click();
			},

			render: function() {
				if (this.state.mode == "render") {

					if (this.props.doc && displayMetadataForTypes.indexOf(this.props.doc.type) > -1) {
						var metaDataComponent = <MetaData ref="md" doc={this.props.doc} onChange={this.onDocChange} />;
					}

					if (this.props.doc && this.props.doc.title) {
						var title = <h1 onClick={this.onMdClick}>{this.props.doc.title}</h1>;
					}

					if (this.props.doc && this.props.doc.subtitle) {
						var subtitle = <h4 onClick={this.onMdClick}>{this.props.doc.subtitle}</h4>;
					}

					if (this.props.doc && this.props.doc.id && typeMap[this.props.doc.type] == typeMap["isaacQuestion"]) {
						var questionId = <h5 className="question-id-meta">{this.props.doc.id}</h5>
					}

					return (
						<div className={"block type-" + this.props.type}  ref="block">
							<div className="row">
								<div className="large-12 columns">
									<Title onClick={this.onClick} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} title={this.props.blockTypeTitle} />
									{metaDataComponent}
									{title}
									{subtitle}
									{questionId}
									{this.props.children}
								</div>
							</div>
						</div>
					);
				}
				else if (this.state.mode == "json") {
					return (
						<div className={"block type-" + this.props.type}  ref="block">
							<div className="row">
								<div className="large-12 columns">
									<Title onClick={this.onClick} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} title={this.props.blockTypeTitle} />
									<JSONEditor doc={this.props.doc} onDone={this.onEditDone} ref="editor"/>
								</div>
							</div>
						</div>
					);
				}
			}
		});
	}
})
