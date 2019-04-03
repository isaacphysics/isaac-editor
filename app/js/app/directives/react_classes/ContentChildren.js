define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, VariantBlock, InsertOp, DeleteOp) {
		
		var ReactTransitionGroup = React.addons.TransitionGroup;
		
		return React.createClass({

			getInitialState: function() {
				return {
					keys: this.props.items.map(function(e,i) {
						return Math.random();
					}),

					itemIds: this.props.items.map(function(e,i) {
						return e.id;
					}),
				};
			},

			onItemChange: function(index, c, oldDoc, newDoc) {
				var oldItems = this.props.items;
				var newItems = this.props.items.slice(0);
				newItems[index] = newDoc;

				this.props.onChange(this, oldItems, newItems);
			},

			onItemInsert: function(insertBeforeIndex) {
				ContentEditor.snippetLoader.loadContentTemplate(this.props.requiredChildType).then(function(t) {
					var oldItems = this.props.items;
					var newItems = oldItems.slice(0);
					newItems.splice(insertBeforeIndex,0,t);

					newKeys = this.state.keys.slice(0);
					newKeys.splice(insertBeforeIndex,0,Math.random());
					this.setState({keys: newKeys});

					this.props.onChange(this, oldItems, newItems);
				}.bind(this)).catch(function(e) {
					console.error("Could not load content template.", e);
				})
			},

			onItemDelete: function(index) {
				var node = $(this.refs["item" + index].getDOMNode());
				node.animate({
					height: "0"
				}, 500);

				var oldItems = this.props.items;
				var newItems = oldItems.slice(0);
				newItems.splice(index,1);

				newKeys = this.state.keys.slice(0);
				newKeys.splice(index,1);
				this.setState({keys: newKeys});

				this.props.onChange(this, oldItems, newItems);
			},

			opsMouseEnter: function(index) {
				if (index >= 0)
					$(this.refs["insertBefore" + index].getDOMNode()).addClass("op-display");
				$(this.refs["insertBefore" + (index + 1)].getDOMNode()).addClass("op-display");
				if (index >= 0)
					$(this.refs["delete" + index].getDOMNode()).addClass("op-display");

			},

			opsMouseLeave: function(index) {

				if (index >= 0)
					$(this.refs["insertBefore" + index].getDOMNode()).removeClass("op-display");
				$(this.refs["insertBefore" + (index + 1)].getDOMNode()).removeClass("op-display");
				if (index >= 0)
					$(this.refs["delete" + index].getDOMNode()).removeClass("op-display");

			},

			onItemIdChange: function(index, e) {
				var newId = e.target.value;
				var oldDoc = this.props.items[index];
				var newDoc = JSON.parse(JSON.stringify(oldDoc));
				newDoc.id = newId;

				this.onItemChange(index, this, oldDoc, newDoc);
			},

			getItemComponent: function(item,index) {

				return (<div key={this.state.keys[index]} className="ops-wrapper children" onMouseEnter={this.opsMouseEnter.bind(this, index)} onMouseLeave={this.opsMouseLeave.bind(this, index)}>
							<InsertOp className="above"
							          onClick={this.onItemInsert.bind(this, index)}
							          onMouseEnter={this.insertMouseEnter.bind(this, index)}
							          onMouseLeave={this.insertMouseLeave.bind(this, index)}
							          ref={"insertBefore" + index}/>

		           			<VariantBlock doc={item}
		           			              disableListOps
		           			              onChange={this.onItemChange.bind(this, index)}
		           			              ref={"item" + index}/>


							<DeleteOp onClick={this.onItemDelete.bind(this, index)}
							          onMouseEnter={this.deleteMouseEnter.bind(this,index)}
							          onMouseLeave={this.deleteMouseLeave.bind(this,index)}
							          ref={"delete" + index} />


		           		</div>);
			},

			insertAtEnd: function() {
				this.onItemInsert(this.props.items.length);
			},

			insertMouseEnter: function(indexAfter) {
				if (indexAfter < this.props.items.length)
					$(this.refs["item" + indexAfter].getDOMNode()).addClass("highlight").addClass("below-split");
				if (indexAfter > 0)
					$(this.refs["item" + (indexAfter - 1)].getDOMNode()).addClass("highlight").addClass("above-split");
				$(this.refs["insertBefore" + indexAfter].getDOMNode()).addClass("highlight");
			},

			insertMouseLeave: function(indexAfter) {
				if (indexAfter < this.props.items.length)
					$(this.refs["item" + indexAfter].getDOMNode()).removeClass("highlight").removeClass("below-split");
				if (indexAfter > 0)
					$(this.refs["item" + (indexAfter - 1)].getDOMNode()).removeClass("highlight").removeClass("above-split");
				$(this.refs["insertBefore" + indexAfter].getDOMNode()).removeClass("highlight");
			},

			deleteMouseEnter: function(index) {
				$(this.refs["item" + index].getDOMNode()).addClass("highlight-delete")
				$(this.refs["id" + index].getDOMNode()).addClass("highlight-delete")
			},

			deleteMouseLeave: function(index) {
				$(this.refs["item" + index].getDOMNode()).removeClass("highlight-delete")
				$(this.refs["id" + index].getDOMNode()).removeClass("highlight-delete")
			},

			onMouseEnter: function() {
				// Make sure final insert op is visible.
				$(this.refs["insertBefore"+this.props.items.length].getDOMNode()).addClass("op-display");
			},

			onMouseLeave: function() {
				$(this.refs["insertBefore"+this.props.items.length].getDOMNode()).removeClass("op-display");
			},

			render: function() {
				console.log(this.props);
				var children = this.props.items.map(this.getItemComponent, this);

				// Add a dummy child if there are no children, allowing a final insert op to be added.
				if (this.props.items.length == 0) {
					children = [
						<div key={Math.random()} className="ops-wrapper children" onMouseEnter={this.opsMouseEnter.bind(this, -1)} onMouseLeave={this.opsMouseLeave.bind(this, -1)} children={[<hr/>]}/>
					];
				}

				// Add the final insert op to the last child.
				children[children.length-1].props.children.push(
					<InsertOp className="below"
							  onClick={this.insertAtEnd}
							  disabled={this.props.disableListOps}
							  onMouseEnter={this.insertMouseEnter.bind(this, this.props.items.length)}
							  onMouseLeave={this.insertMouseLeave.bind(this, this.props.items.length)}
							  ref={"insertBefore" + this.props.items.length}/>
				);

				return (
					<div className="content-children" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
						<ReactTransitionGroup transitionName="content-children">
							{children}
						</ReactTransitionGroup>
					</div>
				);
			}
		});
	}
})
