define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, ContentValue, ContentChildren, InsertOp, DeleteOp) {
		return React.createClass({

			onChildChange: function(child, oldChildren, newChildren) {

				// Something has changed somewhere in our list of children.
				// Set our value to undefined, and our children to the new list.

				this.props.onChange(this, this.props.value, undefined, oldChildren, newChildren);
			},

			onValueChange: function(c, oldValue, newValue) {

				// Our literal value has changed. Set the new value accordingly, and clear our children.

				this.props.onChange(this, oldValue, newValue, this.props.children, undefined);
			},

			render: function() {
				if (this.props.children && this.props.value)
					console.warn("Attempting to render content object with both value and children.", this.props.value, this.props.children);

				if (this.props.children)
					var child = <ContentChildren items={this.props.children} encoding={this.props.encoding} onChange={this.onChildChange}/>;
				else {
					function insertBeforeValue() {
						// Transform to list, add new content object before this one.

						ContentEditor.snippetLoader.loadContentTemplate().then(function(t) {
							var newChildren = [
								t,
								{
									type: "content",
									encoding: this.props.encoding,
									value: this.props.value
								}
							];

							this.props.onChange(this, this.props.value, undefined, this.props.children, newChildren);
						}.bind(this)).catch(function(e) {
							console.error("Unable to load content template", e);
						});
					}

					function insertAfterValue() {
						// Transform to list, add new content object after this one.

						ContentEditor.snippetLoader.loadContentTemplate().then(function(t) {
							var newChildren = [
								{
									type: "content",
									encoding: this.props.encoding,
									value: this.props.value
								},
								t
							];

							this.props.onChange(this, this.props.value, undefined, this.props.children, newChildren);
						}.bind(this)).catch(function(e) {
							console.error("Unable to load content template", e);
						});
					}

					function insertBeforeMouseEnter() {
						$(this.refs.insertBefore.getDOMNode()).addClass("highlight");
						$(this.refs.value.getDOMNode()).addClass("highlight").addClass("below-split");
					}

					function insertBeforeMouseLeave() {
						$(this.refs.insertBefore.getDOMNode()).removeClass("highlight");
						$(this.refs.value.getDOMNode()).removeClass("highlight").removeClass("below-split");
					}

					function insertAfterMouseEnter() {
						$(this.refs.insertAfter.getDOMNode()).addClass("highlight");
						$(this.refs.value.getDOMNode()).addClass("highlight").addClass("above-split");
					}

					function insertAfterMouseLeave() {
						$(this.refs.insertAfter.getDOMNode()).removeClass("highlight");
						$(this.refs.value.getDOMNode()).removeClass("highlight").removeClass("above-split");
					}

					function opsMouseEnter() {
						$(this.refs.insertBefore.getDOMNode()).addClass("op-display");
						$(this.refs.insertAfter.getDOMNode()).addClass("op-display");
					}

					function opsMouseLeave() {
						$(this.refs.insertBefore.getDOMNode()).removeClass("op-display");
						$(this.refs.insertAfter.getDOMNode()).removeClass("op-display");
					}

					var child = (
						<div className="ops-wrapper value" onMouseEnter={opsMouseEnter.bind(this)} onMouseLeave={opsMouseLeave.bind(this)}>
							<InsertOp className="above" onClick={insertBeforeValue.bind(this)}
							          disabled={this.props.disableListOps}
							          ref="insertBefore"
							          onMouseEnter={insertBeforeMouseEnter.bind(this)}
							          onMouseLeave={insertBeforeMouseLeave.bind(this)} />
							<ContentValue value={this.props.value} encoding={this.props.encoding} onChange={this.onValueChange} ref="value"/>
							<InsertOp className="below" onClick={insertAfterValue.bind(this)}
							          disabled={this.props.disableListOps}
							          ref="insertAfter"
							          onMouseEnter={insertAfterMouseEnter.bind(this)}
							          onMouseLeave={insertAfterMouseLeave.bind(this)} />
						</div>);
				}

				return (
					<div className="content-value-or-children">
						{child}
					</div>
				);
			}
		});
	}
})
