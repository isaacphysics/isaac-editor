/** @jsx React.DOM */

var ReactTransitionGroup = React.addons.TransitionGroup;

function generateNewBlock() {
	return {content: "", encoding:"text"};
}

var ContentLiteral = React.createClass({
	getInitialState: function() {
		return { mode: "render" };
	},

	switchToEdit: function(e) {
		this.setState({
			mode: "edit", 
			editedContent: this.props.content
		});
	},

	onDone: function(e) {
		// Could do some validation here.
		var oldContent = this.props.content;
		var newContent = this.state.editedContent;

		this.props.onChange(this, oldContent, newContent);

		this.setState({mode: "render"});
	},

	onContentChange: function(e) {
		this.setState({editedContent: e.target.value})
	},

	render: function() {
		switch (this.state.mode)
		{
		case "render":
			return (
				<div className="row">
					<div className="large-12 columns">
						<div onClick={this.switchToEdit} className="content-literal">{"<" + this.props.encoding + "> " + this.props.content}</div>
					</div>
				</div>
			);
		case "edit":
			return (
				<div>
					<input type="text" value={this.state.editedContent} onChange={this.onContentChange} />
					<button type="button" onClick={this.onDone}>Done</button>
				</div>
			);
		}
	},
});

var ContentList = React.createClass({

	getInitialState: function() {
		return {keys: this.props.items.map(function(e,i) {
			return Math.random();
		})};
	},

	onItemChange: function(index, oldDoc, newDoc) {
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
		var self = this;

		function deleteChild() {
			self.onItemDelete(index);
		}

		function insertBefore() {
			self.onItemInsert(index);
		}

		function change(c,oldDoc, newDoc) {
			self.onItemChange(index,oldDoc,newDoc);
		}

		function mouseEnter(e) {
			self.insertMouseEnter(index);
		}

		function mouseLeave(e) {
			self.insertMouseLeave(index);
		}

		function mouseEnterDelete(e) {
			self.deleteMouseEnter(index);
		}

		function mouseLeaveDelete(e) {
			self.deleteMouseLeave(index);
		}

		return (<div key={this.state.keys[index]} className="ops-wrapper list">
					<InsertOp className="above" onClick={insertBefore} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave} ref={"insertBefore" + index}/>
           			<VariantBlock doc={item} disableListOps onChange={change} ref={"item" + index}/>
					<DeleteOp onClick={deleteChild} onMouseEnter={mouseEnterDelete} onMouseLeave={mouseLeaveDelete}/>
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

		var self = this;
		function endInsertMouseEnter() {
			self.insertMouseEnter(self.props.items.length)
		}

		function endInsertMouseLeave() {
			self.insertMouseLeave(self.props.items.length);
		}

		return (
			<div className="content-list ops-wrapper">
				<ReactTransitionGroup transitionName="content-list">
					{children}
				</ReactTransitionGroup>
				<InsertOp className="below" 
				          onClick={this.insertAtEnd} 
				          disabled={this.props.disableListOps} 
				          onMouseEnter={endInsertMouseEnter} 
				          onMouseLeave={endInsertMouseLeave} 
				          ref={"insertBefore" + this.props.items.length}/>
			</div>
		);
	}
});

var ContentLiteralOrList = React.createClass({

	onChildContentChange: function(child, oldContent, newContent) {
		
		// This is what happens when a child (literal or list) changes within itself. 
		// We need to handle changing from literal -> list (and back) elsewhere.

		this.props.onChange(this, oldContent, newContent);
	},

	render: function() {
		var isList = Array.isArray(this.props.content);
		if (isList)
			var child = <ContentList items={this.props.content} encoding={this.props.encoding} onChange={this.onChildContentChange}/>;
		else {
			var self = this;

			function insertBefore() {
				// Transform to list, add new content object before this one.
				var newContent = [
					generateNewBlock(),
					{
						type: "content",
						encoding: self.props.encoding,
						content: self.props.content
					}
				];

				self.props.onChange(self, self.props.content, newContent);
			}

			function insertAfter() {
				// Transform to list, add new content object after this one.
				var newContent = [
					{
						type: "content",
						encoding: self.props.encoding,
						content: self.props.content
					},
					generateNewBlock()
				];

				self.props.onChange(self, self.props.content, newContent);
			}

			function insertBeforeMouseEnter() {
				$(self.refs.insertBefore.getDOMNode()).addClass("highlight");
				$(self.refs.content.getDOMNode()).addClass("highlight").addClass("below-split");
			}

			function insertBeforeMouseLeave() {
				$(self.refs.insertBefore.getDOMNode()).removeClass("highlight");
				$(self.refs.content.getDOMNode()).removeClass("highlight").removeClass("below-split");
			}

			function insertAfterMouseEnter() {
				$(self.refs.insertAfter.getDOMNode()).addClass("highlight");
				$(self.refs.content.getDOMNode()).addClass("highlight").addClass("above-split");
			}

			function insertAfterMouseLeave() {
				$(self.refs.insertAfter.getDOMNode()).removeClass("highlight");
				$(self.refs.content.getDOMNode()).removeClass("highlight").removeClass("above-split");
			}

			var child = (
				<div className="ops-wrapper literal">
					<InsertOp className="above" onClick={insertBefore} 
					          disabled={this.props.disableListOps} 
					          ref="insertBefore"
					          onMouseEnter={insertBeforeMouseEnter}
					          onMouseLeave={insertBeforeMouseLeave} />
					<ContentLiteral content={this.props.content} encoding={this.props.encoding} onChange={this.onChildContentChange} ref="content"/>
					<InsertOp className="below" onClick={insertAfter} 
					          disabled={this.props.disableListOps} 
					          ref="insertAfter"
					          onMouseEnter={insertAfterMouseEnter}
					          onMouseLeave={insertAfterMouseLeave} />
				</div>);		
		}

		return (
			<div className="content-literal-or-list">
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

	onCaptionChange: function(c,oldVal,newVal) {
		// newVal could be a literal or a list.

		var oldDoc = this.props.doc;
		var newDoc = $.extend({}, this.props.doc, {content: newVal});

		this.props.onChange(this, oldDoc, newDoc);
	},

	render: function() {

		var optionalCaption = <ContentLiteralOrList content={this.props.doc.content} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

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
})

var QuestionBlock = React.createClass({

	onExpositionChange: function(c,oldVal,newVal) {
		// newVal could be a list or a literal
		var oldDoc = this.props.doc;
		var newDoc = $.extend({}, oldDoc, {content: newVal});

		this.props.onChange(this, oldDoc, newDoc);
	},

	onHintsChange: function(c, oldVal, newVal) {
		// newVal must be a list
		var oldDoc = this.props.doc;
		var newDoc = $.extend({}, oldDoc, {hints: newVal});

		this.props.onChange(this, oldDoc, newDoc)
	},

	onAnswerChange: function(c, oldAnswerDoc, newAnswerDoc) {
		// newVal must be a doc
		var oldDoc = this.props.doc;
		var newDoc = $.extend({}, oldDoc, {answer: newAnswerDoc})

		this.props.onChange(this, oldDoc, newDoc);
	},

	render: function() {

		var exposition = <ContentLiteralOrList content={this.props.doc.content} encoding={this.props.doc.encoding} onChange={this.onExpositionChange}/>;
		var optionalHints = <Block type="hints" blockTypeTitle="Hints"><ContentLiteralOrList content={this.props.doc.hints || []} onChange={this.onHintsChange}/></Block>

		return (
			<Block type="question" blockTypeTitle="Question">
				{exposition}
				<div className="question-answer"><VariantBlock blockTypeTitle="Answer" doc={this.props.doc.answer} onChange={this.onAnswerChange}/></div>
				{optionalHints}
			</Block>
		);
	}
});

var ContentBlock = React.createClass({

	onContentChange: function(c, oldVal, newVal) {
		// newVal could be a literal or a list.
		var oldDoc = this.props.doc;
		var newDoc = $.extend({}, oldDoc, {content: newVal});

		this.props.onChange(this, oldDoc, newDoc);
	},

	render: function() {
		if (typeMap[this.props.doc.type] != ContentBlock) {
			return <div className="block type-unknown">[Block of unknown content type: '{this.props.doc.type}']</div>;
		}

		return (
			<Block type="content" blockTypeTitle={this.props.blockTypeTitle}>
				<ContentLiteralOrList content={this.props.doc.content} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
			</Block>
		);
	}
});

var EquationBlock = React.createClass({
	onContentChange: function(c, oldVal, newVal) {
		// newVal could be a literal or a list.
		var oldDoc = this.props.doc;
		var newDoc = $.extend({}, oldDoc, {content: newVal});

		this.props.onChange(this, oldDoc, newDoc);
	},

	render: function() {

		return (
			<Block type="equation" blockTypeTitle="Equation">
				<div className="row">
					<div className="large-10 large-offset-1 columns text-center">
						<ContentLiteral content={this.props.doc.content} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
					</div>
				</div>
			</Block>
		);
	}

})

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

typeMap = {"image": FigureBlock,
		   "figure": FigureBlock,
		   "content": ContentBlock,
		   "concept": ContentBlock,
		   "section": ContentBlock,
		   "subsection": ContentBlock,
		   "equation": EquationBlock,
		   "legacy_latex_question_numeric": ContentBlock,
			"question": QuestionBlock};

function docChanged(c,oldDoc,newDoc) {
	console.log("Document changed:", newDoc);
	c.setProps({doc: newDoc});
}

$.get("example_question.json").then(function(d) {
	d = JSON.parse(d);
	console.log("Loaded:", d);
	React.renderComponent(<ContentBlock doc={d} onChange={docChanged} blockTypeTitle="Content Object"/>, $("#react-container")[0]);
});
