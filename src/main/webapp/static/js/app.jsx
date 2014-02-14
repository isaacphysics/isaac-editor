/** @jsx React.DOM */

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
			return <div onClick={this.switchToEdit} className="content-literal">{"<" + this.props.encoding + "> " + this.props.content}</div>;
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

	onItemChange: function(child, oldDoc, newDoc) {
		var oldItems = this.props.items;
		var newItems = this.props.items.slice(0);
		newItems[child.props.key] = newDoc;

		this.props.onChange(this, oldItems, newItems);
	},

	onItemInsert: function(insertBeforeIndex) {
		var oldItems = this.props.items;
		var newItems = oldItems.slice(0);
		newItems.splice(insertBeforeIndex,0,{content: "New thing!", "type": "content"});

		this.props.onChange(this, oldItems, newItems);
	},

	onItemDelete: function(itemIndex) {
		var oldItems = this.props.items;
		var newItems = oldItems.slice(0);
		newItems.splice(itemIndex,1);

		this.props.onChange(this, oldItems, newItems);
	},

	getItemComponent: function(item,index) {
		var self = this;

		function deleteChild() {
			self.onItemDelete(index);
		}

		function insertAfter() {
			self.onItemInsert(index+1);
		}

		function insertBefore() {
			self.onItemInsert(index);
		}

		return (<div className="block-ops-wrapper">
           			<code onClick={insertBefore}>INSERT_BEFORE</code>
           			<code onClick={deleteChild}> DEL </code> 
           			<code onClick={insertAfter}>INSERT_AFTER</code>
           			
           			<VariantBlock doc={item} key={index} onChange={this.onItemChange} /> 
           		</div>);
	},

	render: function() {
		var children = this.props.items.map(this.getItemComponent, this);

		return (
			<div className="content-list">
				{children}
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
			var child = <ContentList items={this.props.content} encoding={this.props.encoding} onChange={this.onChildContentChange}/>
		else
			var child = <ContentLiteral content={this.props.content} encoding={this.props.encoding} onChange={this.onChildContentChange}/>

		return (
			<div className="content-literal-or-list">
				<code>Literal-or-list (Currently {isList ? "LIST" : "LITERAL"})</code>
				{child}
			</div>
		);
	},
});

var VariantBlock = React.createClass({
	render: function() {
		var DocClass = typeMap[this.props.doc.type];
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
			<div className="block-type-figure">
				<img src={this.props.doc.src} />
				{optionalCaption}
			</div>
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
		var optionalHints = <ContentLiteralOrList content={this.props.doc.hints} onChange={this.onHintsChange}/>

		return (
			<div className="question">
				<code>QUESTION_BLOCK</code>
				{exposition}
				<div className="question-answer">[ANSWER]:<VariantBlock doc={this.props.doc.answer} onChange={this.onAnswerChange}/></div>
				{optionalHints}
			</div>
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
			return <div className="block-type-unknown">[Block of unknown content type: '{this.props.doc.type}']</div>;
		}

		return (<div className="block-type-content">
					<ContentLiteralOrList content={this.props.doc.content} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
				</div>);
	}
});

typeMap = {"image": FigureBlock,
		   "content": ContentBlock,
		   "legacy_latex_question_numeric": ContentBlock,
			"question": QuestionBlock};

function docChanged(c,oldDoc,newDoc) {
	console.log("Document changed:", newDoc);
	c.setProps({doc: newDoc});
}

$.get("example_question.json").then(function(d) {
	d = JSON.parse(d);
	console.log("Loaded:", d);
	React.renderComponent(<ContentBlock doc={d} onChange={docChanged}/>, $("#react-container")[0]);
});
