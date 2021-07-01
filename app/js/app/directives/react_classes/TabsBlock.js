define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, VariantBlock) {
		return React.createClass({

			getInitialState: function() {
				return {
					activeTab: this.props.doc.children.length > 0 ? 0 : null
				}
			},

			onDocChange: function(c, oldDoc, newDoc) {
				this.props.onChange(this, oldDoc, newDoc);
			},

			activateTab: function(i) {
				this.setState({
					activeTab: null
				}, function() {
					this.setState({
						activeTab: parseInt(i)
					})
				});
			},

			setId: function() {
				var newId = window.prompt("Type a new ID for this tab:", this.props.doc.children[this.state.activeTab].id);
				if (newId != null)
				{
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children[this.state.activeTab].id = newId;

					this.onDocChange(this, oldDoc, newDoc);
					this.forceUpdate();
				}
			},

			setTitle: function() {
				var newTitle = window.prompt("Type a new title for this tab:", this.props.doc.children[this.state.activeTab].title);
				if (newTitle != null)
				{
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children[this.state.activeTab].title = newTitle;

					this.onDocChange(this, oldDoc, newDoc);
					this.forceUpdate();
				}
			},

			deleteTab: function() {
				var doIt = window.confirm("Are you sure you want to delete this tab?");

				if (doIt) {
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);
					newDoc.children.splice(this.state.activeTab,1);

					this.onDocChange(this, oldDoc, newDoc);
					this.setState({
						activeTab: newDoc.children.length > 0 ? 0 : null
					})
				}
			},

			addTab: function() {

				ContentEditor.snippetLoader.loadContentTemplate("tab").then(function(t) {

					var newDoc = $.extend({}, this.props.doc);
					newDoc.children.push(t);

					this.onDocChange(this, this.props.doc, newDoc);
					this.setState({
						activeTab: newDoc.children.length - 1
					})

				}.bind(this)).catch(function(e) {
					console.error("Unable to load tab template", e);
				});

			},

			moveTab: function(increment) {
				return function() {
					// Duplicate doc
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, this.props.doc);

					// Use destructured assignment
					var oldIndex = this.state.activeTab;
					var newIndex = oldIndex + increment;
					[newDoc.children[oldIndex], newDoc.children[newIndex]] = [newDoc.children[newIndex], newDoc.children[oldIndex]];

					// Update
					this.setState({activeTab: newIndex});
					this.onDocChange(this, oldDoc, newDoc);
				}.bind(this);
			},

			onTabChange: function(activeTab, c, oldVal, newVal) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[activeTab] = newVal;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			},

			render: function() {

				var tabButtons = [];

				for(var i in this.props.doc.children) {
					var t = this.props.doc.children[i];

					var button = <button key={"tabButton" + i} onClick={this.activateTab.bind(this, i)} className={"round " + (this.state.activeTab == i ? "active-tab" : "inactive-tab")}>{i}: {t.title}</button>;
					tabButtons.push(button);
				}

				var button = <button key="newTabButton" onClick={this.addTab} className={"round alert tiny"}><i className="foundicon-plus"></i></button>;
				tabButtons.push(button);

				if (this.state.activeTab != null) {
					var editTitle = null;
					if (!this.props.hasOwnProperty("allowTabTitles") || this.props.allowTabTitles !== "false") {
						editTitle = <span><button onClick={this.setTitle} className="tiny radius">Edit tab title...</button>&nbsp;</span>
					}
					var thisTab = <div className="active-tab">
						<div style={{textAlign: "right"}}>
							<span><small>ID: {this.props.doc.children[this.state.activeTab].id}&nbsp;</small></span>
							<button onClick={this.setId} className="tiny radius">Edit tab ID...</button>&nbsp;
							{editTitle}
							<button onClick={this.moveTab(-1)} className="tiny secondary" disabled={this.state.activeTab === 0}>ᐊ</button>
							<button onClick={this.moveTab(1)} className="tiny secondary" disabled={this.state.activeTab === this.props.doc.children.length - 1}>ᐅ</button>&nbsp;
							<button onClick={this.deleteTab} className="tiny radius alert">Delete tab</button>
						</div>
						<VariantBlock key={this.state.activeTab} doc={this.props.doc.children[this.state.activeTab]} onChange={this.onTabChange.bind(this, this.state.activeTab)} />
					</div>;
				}

				return 	(
					<Block type="tabs" blockTypeTitle="Tabs" doc={this.props.doc} onChange={this.onDocChange.bind(this)}>
						<div className="row tabs-content">
							<div className="small-12 columns">
								{tabButtons} <br/>
								{thisTab}
							</div>
						</div>
					</Block>
				);

			}
		});
	}
})
