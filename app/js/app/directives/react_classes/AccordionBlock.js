define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, VariantBlock) {
		return React.createClass({

			getInitialState: function() {
				return {
					activeSection: this.props.doc.children.length > 0 ? 0 : null
				}
			},

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			activateSection: function(i) {
				this.setState({
					activeSection: null
				}, function() {
					this.setState({
						activeSection: i
					})
				});
			},

			setId: function() {
				var newId = window.prompt("Type a new ID for this accordion section:", this.props.doc.children[this.state.activeSection].id);
				if (newId != null)
				{
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children[this.state.activeSection].id = newId;

					this.onDocChange(this, oldDoc, newDoc);
					this.forceUpdate();
				}
			},

			setTitle: function() {
				var newTitle = window.prompt("Type a new title for this accordion section:", this.props.doc.children[this.state.activeSection].title);
				if (newTitle != null)
				{
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children[this.state.activeSection].title = newTitle;

					this.onDocChange(this, oldDoc, newDoc);
					this.forceUpdate();
				}
			},

			setLevel: function() {
				var newLevel = window.prompt("Type a new level for this accordion section. This should be an integer 1-6.", this.props.doc.children[this.state.activeSection].level);
				if (newLevel != null && ((parseInt(newLevel) > 0 && parseInt(newLevel) < 7) || newLevel === "")) {
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children[this.state.activeSection].level = newLevel;

					this.onDocChange(this, oldDoc, newDoc);
					this.forceUpdate();
				} else {
					window.alert("Invalid level entered: " + newLevel);
				}
			},

			deleteSection: function() {
				var doIt = window.confirm("Are you sure you want to delete this section?");

				if (doIt) {
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children.splice(this.state.activeSection,1);

					this.onDocChange(this, oldDoc, newDoc);
					this.setState({
						activeSection: newDoc.children.length > 0 ? 0 : null
					})
				}
			},

			addSection: function() {

				ContentEditor.snippetLoader.loadContentTemplate("accordionSection").then(function(t) {

					var newDoc = $.extend({}, this.props.doc);
					newDoc.children.push(t);

					this.onDocChange(this, this.props.doc, newDoc);
					this.setState({
						activeSection: newDoc.children.length - 1
					})

				}.bind(this)).catch(function(e) {
					console.error("Unable to load accordion section template", e);
				});

			},

			onSectionChange: function(activeSection, c, oldVal, newVal) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[activeSection] = newVal;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			},

			onScroll: function(e) {
				if (!this.refs.sectionButtons)
					return; // We are in edit mode, so no section buttons were rendered.

				var sectionButtons = $(this.refs.sectionButtons.getDOMNode());
				var sectionButtonsTop = sectionButtons.offset().top - $(document).scrollTop();

				var maxPadding = sectionButtons.parent().height() - sectionButtons.height();

				sectionButtons.css("padding-top", Math.max(0,Math.min(maxPadding, -sectionButtonsTop)));
			},

			componentDidMount: function() {
				$(document).on("scroll", this.onScroll);
			},

			componentWillUnmount: function() {
				$(document).off("scroll");
			},

			render: function() {

				var sectionButtons = [];

				for(var i in this.props.doc.children) {
					var t = this.props.doc.children[i];

					var button = <button key={"sectionButton"+i}  onClick={this.activateSection.bind(this, i)} className={"round " + (this.state.activeSection == i ? "active-section" : "inactive-section")}> {t.level ? "Level " + t.level : "Section " + i}</button>;
					sectionButtons.push(button);
					sectionButtons.push(<br key={Math.random()}/>);
				}

				var button = <button key="newSectionButton" onClick={this.addSection} className={"round alert tiny"}><i className="foundicon-plus"></i></button>;
				sectionButtons.push(button);

				if (this.state.activeSection != null) {
					var thisSection = <div className="active-accordion-section">
						<div style={{textAlign: "right"}}>
							<span><small>ID: {this.props.doc.children[this.state.activeSection].id}&nbsp;</small></span>
							<button onClick={this.setId} className="tiny radius">Edit section ID...</button>&nbsp;
							<button onClick={this.setTitle} className="tiny radius">Edit section title...</button>&nbsp;
							<button onClick={this.setLevel} className="tiny radius">Edit section level...</button>&nbsp;
							<button onClick={this.deleteSection} className="tiny radius alert">Delete section</button>
						</div>
						<VariantBlock doc={this.props.doc.children[this.state.activeSection]} onChange={this.onSectionChange.bind(this, this.state.activeSection)} />
					</div>;
				}

				return 	(
					<Block type="accordion" blockTypeTitle="Accordion" doc={this.props.doc} onChange={this.onDocChange}>
						<div className="row accordion-content">
							<div className="small-2 columns section-buttons" ref="sectionButtons">
								{sectionButtons}
							</div>
							<div className="small-10 columns accordion-section">
								{thisSection}
							</div>
						</div>
					</Block>
				);

			}
		});
	}
})
