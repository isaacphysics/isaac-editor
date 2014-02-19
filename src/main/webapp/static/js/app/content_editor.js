/** @jsx React.DOM */
define(["react", "jquery"], function(React, $) {

	var ReactTransitionGroup = React.addons.TransitionGroup;

/////////////////////////////////
// Constructor
/////////////////////////////////

	function ContentEditor(container, document) {
		console.log("Loading doc into JSON editor:", document);

		this.editor = <VariantBlock doc={document}  blockTypeTitle="Content Object"/>;
		this.editor.props.onChange = docChanged.bind(this);
		
		this.history = [];

		React.renderComponent(this.editor, container);

	}

/////////////////////////////////
// Private static component classes
/////////////////////////////////

	var ContentValue = React.createClass({
		getInitialState: function() {
			return { mode: "render" };
		},

		switchToEdit: function(e) {
			this.setState({
				mode: "edit", 
				editedValue: this.props.value
			});
		},

		onDone: function(e) {
			// Could do some validation here.
			var oldValue = this.props.value;
			var newValue = this.state.editedValue;

			this.props.onChange(this, oldValue, newValue);

			this.setState({mode: "render"});
		},

		onValueChange: function(e) {
			this.setState({editedValue: e.target.value})
		},

		render: function() {
			switch (this.state.mode)
			{
			case "render":
				return (
					<div className="row">
						<div className="large-12 columns">
							<div onClick={this.switchToEdit} className="content-value">{"<" + this.props.encoding + "> " + this.props.value}</div>
						</div>
					</div>
				);
			case "edit":
				return (
					<div>
						<input type="text" value={this.state.editedValue} onChange={this.onValueChange} />
						<button type="button" onClick={this.onDone}>Done</button>
					</div>
				);
			}
		},
	});

	var ContentChildren = React.createClass({

		getInitialState: function() {
			return {keys: this.props.items.map(function(e,i) {
				return Math.random();
			})};
		},

		onItemChange: function(index, c, oldDoc, newDoc) {
			var oldItems = this.props.items;
			var newItems = this.props.items.slice(0);
			newItems[index] = newDoc;

			this.props.onChange(this, oldItems, newItems);
		},

		onItemInsert: function(insertBeforeIndex) {
			var oldItems = this.props.items;
			var newItems = oldItems.slice(0);
			newItems.splice(insertBeforeIndex,0,generateNewBlock());

			newKeys = this.state.keys.slice(0);
			newKeys.splice(insertBeforeIndex,0,Math.random());
			this.setState({keys: newKeys});

			this.props.onChange(this, oldItems, newItems);
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

		getItemComponent: function(item,index) {

			return (<div key={this.state.keys[index]} className="ops-wrapper children">
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
						          onMouseLeave={this.deleteMouseLeave.bind(this,index)}/>

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
		},

		deleteMouseLeave: function(index) {
			$(this.refs["item" + index].getDOMNode()).removeClass("highlight-delete")
		},

		render: function() {
			var children = this.props.items.map(this.getItemComponent, this);

			return (
				<div className="content-children ops-wrapper">

					<ReactTransitionGroup transitionName="content-children">
						{children}
					</ReactTransitionGroup>

					<InsertOp className="below" 
					          onClick={this.insertAtEnd} 
					          disabled={this.props.disableListOps} 
					          onMouseEnter={this.insertMouseEnter.bind(this, children.length)} 
					          onMouseLeave={this.insertMouseLeave.bind(this, children.length)} 
					          ref={"insertBefore" + this.props.items.length}/>

				</div>
			);
		}
	});
 
 	var ContentValueOrChildren = React.createClass({

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
				var self = this;

				function insertBeforeValue() {
					// Transform to list, add new content object before this one.
					var newChildren = [
						generateNewBlock(),
						{
							type: "content",
							encoding: self.props.encoding,
							value: self.props.value
						}
					];

					self.props.onChange(self, self.props.value, undefined, self.props.children, newChildren);
				}

				function insertAfterValue() {
					// Transform to list, add new content object after this one.
					var newChildren = [
						{
							type: "content",
							encoding: self.props.encoding,
							value: self.props.value
						},
						generateNewBlock()
					];

					self.props.onChange(self, self.props.value, undefined, self.props.children, newChildren);
				}

				function insertBeforeMouseEnter() {
					$(self.refs.insertBefore.getDOMNode()).addClass("highlight");
					$(self.refs.value.getDOMNode()).addClass("highlight").addClass("below-split");
				}

				function insertBeforeMouseLeave() {
					$(self.refs.insertBefore.getDOMNode()).removeClass("highlight");
					$(self.refs.value.getDOMNode()).removeClass("highlight").removeClass("below-split");
				}

				function insertAfterMouseEnter() {
					$(self.refs.insertAfter.getDOMNode()).addClass("highlight");
					$(self.refs.value.getDOMNode()).addClass("highlight").addClass("above-split");
				}

				function insertAfterMouseLeave() {
					$(self.refs.insertAfter.getDOMNode()).removeClass("highlight");
					$(self.refs.value.getDOMNode()).removeClass("highlight").removeClass("above-split");
				}

				var child = (
					<div className="ops-wrapper value">
						<InsertOp className="above" onClick={insertBeforeValue} 
						          disabled={this.props.disableListOps} 
						          ref="insertBefore"
						          onMouseEnter={insertBeforeMouseEnter}
						          onMouseLeave={insertBeforeMouseLeave} />
						<ContentValue value={this.props.value} encoding={this.props.encoding} onChange={this.onValueChange} ref="value"/>
						<InsertOp className="below" onClick={insertAfterValue} 
						          disabled={this.props.disableListOps} 
						          ref="insertAfter"
						          onMouseEnter={insertAfterMouseEnter}
						          onMouseLeave={insertAfterMouseLeave} />
					</div>);		
			}

			return (
				<div className="content-value-or-children">
					{child}
				</div>
			);
		},
	});

	var InsertOp = React.createClass({
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

	var DeleteOp = React.createClass({
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

	var VariantBlock = React.createClass({
		render: function() {
			if (this.props.doc.type)
				var DocClass = typeMap[this.props.doc.type];
			else
				var DocClass = UnknownBlock;
			return this.transferPropsTo(DocClass ? DocClass() : <ContentBlock />);
		},
	});

	var FigureBlock = React.createClass({

		onCaptionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			// newVal could be a string or a list.

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, this.props.doc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.props.onChange(this, oldDoc, newDoc);
		},

		render: function() {

			var optionalCaption = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

			return (
				<Block type="figure" blockTypeTitle="Figure">
					<div className="row">
						<div className="small-6 columns">
							<img src={this.props.doc.src} />
						</div>
						<div className="small-6 columns">
							{optionalCaption}
						</div>					
					</div>
				</Block>
			);
		}
	});

	var QuestionBlock = React.createClass({

		onExpositionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			// newVal could be a list or a string
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.props.onChange(this, oldDoc, newDoc);
		},

		onHintsChange: function(c, oldChildren, newChildren) {
			// newVal must be a list
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.hints = newChildren;

			this.props.onChange(this, oldDoc, newDoc)
		},

		onAnswerChange: function(c, oldAnswerDoc, newAnswerDoc) {
			// newVal must be a doc
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.answer = newAnswerDoc;

			this.props.onChange(this, oldDoc, newDoc);
		},

		render: function() {

			var exposition = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onExpositionChange}/>;
			var optionalHints = <Block type="hints" blockTypeTitle="Hints"><ContentChildren items={this.props.doc.hints || []} encoding={this.encoding} onChange={this.onHintsChange}/></Block>

			return (
				<Block type="question" blockTypeTitle="Question">
					{exposition}
					<div class="row">
						<div class="large-6 columns">
							<div className="question-answer"><VariantBlock blockTypeTitle="Answer" doc={this.props.doc.answer} onChange={this.onAnswerChange}/></div>
						</div>
						<div class="large-6 columns">
							{optionalHints}
						</div>
					</div>
				</Block>
			);
		}
	});

	var ContentBlock = React.createClass({

		onContentChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			// newVal could be a string or a list.
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.props.onChange(this, oldDoc, newDoc);
		},

		render: function() {
			if (typeMap[this.props.doc.type] != ContentBlock) {
				return <div className="block type-unknown">[Block of unknown content type: '{this.props.doc.type}']</div>;
			}

			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle}>
					<ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
				</Block>
			);
		}
	});

	var UnknownBlock = React.createClass({

		chooseType: function(e) {
			var newDoc = $.extend({}, this.props.doc, {type: $(e.target).data("chosenType")});

			this.props.onChange(this, this.props.doc, newDoc);
		},

		render: function() {
			return (
				<Block type="unknown" blockTypeTitle="?">
					<div className="row">
						<div className="large-8 large-offset-2 columns text-center">
							Please choose a block type: <br/>
							<a onClick={this.chooseType} data-chosen-type="content">content</a> | 
							<a onClick={this.chooseType} data-chosen-type="question">question</a> | 
							<a onClick={this.chooseType} data-chosen-type="figure">figure</a>
						</div>
					</div>
				</Block>
			);
		}
	});

	var Block = React.createClass({

		getDefaultProps: function() {
			return {
				blockTypeTitle: "",
			};
		},

		onMouseEnter: function() {
			$(this.refs.block.getDOMNode()).addClass("highlight");
		},

		onMouseLeave: function() {
			$(this.refs.block.getDOMNode()).removeClass("highlight");
		},

		render: function() {
			return (
				<div className={"block type-" + this.props.type}  ref="block">
					<div className="row">
						<div className="large-12 columns">
							<h1 onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>{this.props.blockTypeTitle}</h1>
							{this.props.children}
						</div>
					</div>
				</div>
			);
		}
	});

/////////////////////////////////
// Private static fields
/////////////////////////////////

	var typeMap = {
		"image": FigureBlock,
		"figure": FigureBlock,
		"content": ContentBlock,
		"concept": ContentBlock,
		"legacy_latex_question_numeric": ContentBlock,
		"question": QuestionBlock
	};


/////////////////////////////////
// Private static methods
/////////////////////////////////

	function generateNewBlock() {
		return {value: "", encoding:"text"};
	}

/////////////////////////////////
// Private instance methods
/////////////////////////////////

	// Must be called with 'this' bound to the instance.
	function docChanged(c, oldDoc, newDoc) {
		console.log("Document changed:", newDoc);

		this.history.push(oldDoc);
		this.editor.setProps({doc: newDoc});
		$(this.editor.getDOMNode()).trigger("docChanged", [oldDoc, newDoc]);
	}

/////////////////////////////////
// Public instance methods
/////////////////////////////////

	ContentEditor.prototype.undo = function() {
		this.editor.setProps({doc: this.history.pop()});
	}

	return ContentEditor;


});
