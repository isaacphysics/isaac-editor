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

	componentWillReceiveProps: function(p) {
		console.log("receiving props:", this, p);
	},

	render: function() {
		switch (this.state.mode)
		{
		case "render":
			return (
				<div className="row">
					<div className="large-6 large-offset-3 end columns">
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
		newItems.splice(insertBeforeIndex,0,{content: "New thing!", "type": "content"});

		newKeys = this.state.keys.slice(0);
		newKeys.splice(insertBeforeIndex,0,Math.random());
		this.setState({keys: newKeys});

		this.props.onChange(this, oldItems, newItems);
	},

	onItemDelete: function(itemIndex) {
		var oldItems = this.props.items;
		var newItems = oldItems.slice(0);
		newItems.splice(itemIndex,1);

		newKeys = this.state.keys.slice(0);
		newKeys.splice(itemIndex,1);
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

		return (<div key={this.state.keys[index]} className="list-ops-wrapper">
					<InsertOp onClick={insertBefore}/>
           			
           			<VariantBlock doc={item} disableListOps onChange={change} /> 
					<DeleteOp onClick={deleteChild}/>
           		</div>);
	},

	insertAtEnd: function() {
		this.onItemInsert(this.props.items.length);
	},

	render: function() {
		var children = this.props.items.map(this.getItemComponent, this);

		return (
			<div className="content-list">
				{children}
				<InsertOp onClick={this.insertAtEnd} disabled={this.props.disableListOps} />
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
					{
						type: "content",
						encoding: "text",
						content: "New content!",
					},
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
					{
						type: "content",
						encoding: "text",
						content: "New content!"
					}
				];

				self.props.onChange(self, self.props.content, newContent);
			}


			var child = (
				<div className="literal-ops-wrapper">
					<InsertOp onClick={insertBefore} disabled={this.props.disableListOps} />
					<ContentLiteral content={this.props.content} encoding={this.props.encoding} onChange={this.onChildContentChange}/>
					<InsertOp onClick={insertAfter} disabled={this.props.disableListOps} />
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

		return (
			<div className="row">
				<div className="small-6 small-centered columns op-insert text-center">
					<code onClick={this.props.onClick}>INSERT</code>
				</div>
			</div>
		);

	}
});

var DeleteOp = React.createClass({
	render: function() {
		if (this.props.disabled)
			return <div  />;

		return (
			<div className="right"><code onClick={this.props.onClick}>DELETE</code></div>
		);

	}
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
			<Block type="figure" blockTypeTitle="Figure">
				<img src={this.props.doc.src} />
				{optionalCaption}
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
		var optionalHints = <Block type="hints" blockTypeTitle="Hints"><ContentLiteralOrList content={this.props.doc.hints} onChange={this.onHintsChange}/></Block>

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
						<h1 className="left" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>{this.props.blockTypeTitle}</h1>
						{this.props.children}
					</div>
				</div>
			</div>
		);
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
