/** @jsx React.DOM */
define(["react", "jquery", "rsvp", "codemirrorJS", "showdown", "app/MathJaxConfig"], function(React, $) {
	
	var Showdown = require("showdown");
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
		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	}

/////////////////////////////////
// Public static fields
/////////////////////////////////

	ContentEditor.fileLoader = function(path) {
		return new RSVP.Promise(function(resolve, reject) {
			console.error("No file loader provided for file", path);
			reject();
		});
	};

	ContentEditor.figureUploader = function(fileToUpload, originalName) {
		return new RSVP.Promise(function(resolve, reject) {
			console.error("No file uploader provided")
			// A real figureUploader would return the path to the uploaded image that can then be loaded with fileLoader
			return reject();
		});
	}

/////////////////////////////////
// Private static component classes
/////////////////////////////////

	var Title = React.createClass({
		render: function() {
			if (this.props.title)
				return (
					<div className="title-container" onMouseEnter={this.props.onMouseEnter} onMouseLeave={this.props.onMouseLeave} onClick={this.props.onClick}>
						<div className="title-content">{this.props.title}</div>
						<div className="title-triangle"></div>
					</div>
				);
			else
				return <div className="title-placeholder"/>;
		}
	});

	var ContentValue = React.createClass({
		getInitialState: function() {
			return { mode: "render" };
		},

		switchToEdit: function(e) {

			var hasDefault = (/^_Enter .* Here_$/i).test(this.props.value);

			this.setState({
				mode: "edit", 
				editedValue: hasDefault ? "" : this.props.value
			});
		},

		onDone: function(e) {

			$(this.getDOMNode()).find(".CodeMirror").remove();

			// Could do some validation here.
			var oldValue = this.props.value;
			var newValue = this.state.editedValue;

			this.props.onChange(this, oldValue, newValue);

			this.setState({mode: "render"});
		},

		onValueChange: function(e) {
			this.setState({editedValue: e.target.value})
		},

		componentDidUpdate: function(prevProps, prevState) {
			if (this.state.mode == "edit" && prevState.mode != "edit") {
				var cm = app.cm = CodeMirror(this.refs.placeholder.getDOMNode(), 
					{mode: "",
					 theme: "eclipse",//"solarized light",
					 lineNumbers: false,
					 value: this.state.editedValue,
					 lineWrapping: true});

				cm.on("change", (function(inst, changeObj) { 
					this.setState({editedValue: inst.getValue()});
				}).bind(this));
			}
			MathJax.resetLabels();
			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

		},

		componentDidMount: function() {
					MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		},

		render: function() {
			switch (this.state.mode)
			{
			case "render":

				var renderer = <div onClick={this.switchToEdit} className="content-value"/>;

				switch (this.props.encoding) {
					case "html":
						renderer.props.dangerouslySetInnerHTML = {__html: this.props.value};
						break;
					case "markdown":
						var converter = new Showdown.converter();
						var html = converter.makeHtml(this.props.value);
						renderer.props.dangerouslySetInnerHTML = {__html: html};
						break;
					default:
						renderer.props.children = "<" + this.props.encoding + "> " + this.props.value;
						break;
				}

				return (
					<div className="row">
						<div className="large-12 columns">
							{renderer}
						</div>
					</div>
				);
			case "edit":
				return (
					<div>
						<div ref="placeholder" />
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
		},

		deleteMouseLeave: function(index) {
			$(this.refs["item" + index].getDOMNode()).removeClass("highlight-delete")
		},

		onMouseEnter: function() {
			// Make sure final insert op is visible.
			$(this.refs["insertBefore"+this.props.items.length].getDOMNode()).addClass("op-display");
		},

		onMouseLeave: function() {
			$(this.refs["insertBefore"+this.props.items.length].getDOMNode()).removeClass("op-display");
		},

		render: function() {
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

	var JSONEditor = React.createClass({

		getInitialState: function() {
			return {
				valid: true,
				editedDoc: this.props.doc,
			};
		},

		componentDidMount: function() {
			var cm = app.cm = CodeMirror(this.refs.content.getDOMNode(), 
				{mode: {name: "javascript", json: true},
				 theme: "eclipse",//"solarized light",
				 lineNumbers: false,
				 value: JSON.stringify(this.props.doc,null,2),
				 lineWrapping: true});

			cm.on("change", (function(inst, changeObj) { 
				try {
					var newDoc = JSON.parse(cm.getValue());
					this.setState({valid: true, editedDoc: newDoc});
					for(var i = 0; i < inst.lineCount(); i++)
						inst.removeLineClass(i, "background", "cm-error-line");
				} catch (e) {
					console.error(e);
					inst.addLineClass(changeObj.from.line, "background", "cm-error-line");
					this.setState({valid: false});
				}
			}).bind(this));

		},

		onDone: function() {
			if (this.state.valid) {
				var newDoc = this.state.editedDoc;
				this.props.onDone(this, this.props.doc, newDoc);
			}
		},

		render: function() {
			return (
				<div>
					<div ref="content" />
					<button type="button" onClick={this.onDone}>Done</button>
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
				function insertBeforeValue() {
					// Transform to list, add new content object before this one.
					var newChildren = [
						generateNewBlock(),
						{
							type: "content",
							encoding: this.props.encoding,
							value: this.props.value
						}
					];

					this.props.onChange(this, this.props.value, undefined, this.props.children, newChildren);
				}

				function insertAfterValue() {
					// Transform to list, add new content object after this one.
					var newChildren = [
						{
							type: "content",
							encoding: this.props.encoding,
							value: this.props.value
						},
						generateNewBlock()
					];

					this.props.onChange(this, this.props.value, undefined, this.props.children, newChildren);
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
			return this.transferPropsTo(DocClass ? DocClass() : <Block blockTypeTitle={"Unknown content type: " + this.props.doc.type} />);
		},
	});

	var FigureBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onCaptionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, this.props.doc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.onDocChange(this, oldDoc, newDoc);
		},

		loadImg: function() {

			ContentEditor.fileLoader(this.props.doc.src).then((function(dataUrl){
				$(this.refs.img.getDOMNode()).attr("src", dataUrl);
			}).bind(this)).catch((function() {
				console.error("Failed to load image", this.props.doc.src);
			}).bind(this));
		},

		onSrcChange: function(newSrc) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, this.props.doc);
			newDoc.src = newSrc;

			this.onDocChange(this, oldDoc, newDoc);
		},

		selectFile: function(file) {
			var reader = new FileReader();
			var self = this;
			reader.onload = function(e) {
				console.log("Loaded", file);
				ContentEditor.figureUploader(reader.result, file.name).then(function(relativePath) {
					console.log("Newly created relative file path:", relativePath);

					self.onSrcChange(relativePath);
				});
			};

			reader.readAsBinaryString(file)

		},

		componentDidMount: function() {
			this.loadImg();
		},

		componentDidUpdate: function() {
			this.loadImg();
		},

		img_Click: function() {
			this.refs.fileInput.getDOMNode().click();
		},

		img_DragOver: function(e) {
			e.stopPropagation();
			e.preventDefault();
			e.nativeEvent.dataTransfer.dropEffect = "copy";
		},

		img_Drop: function(e) {
			e.stopPropagation();
			e.preventDefault();

			if (e.nativeEvent.dataTransfer.files.length != 1)
				return;

			this.selectFile(e.nativeEvent.dataTransfer.files[0]);
		},

		file_Change: function(e) {
			e.stopPropagation();
			e.preventDefault();

			if (e.target.files.length != 1)
				return;

			this.selectFile(e.target.files[0]);
		},

		render: function() {

			var optionalCaption = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

			return (
				<Block type="figure" blockTypeTitle="Figure" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-6 columns text-center">
							<img width="250px" height="250px" src="static/images/not-found.png" ref="img" onClick={this.img_Click} accept="image/svg+xml,image/png" onDragOver={this.img_DragOver} onDrop={this.img_Drop} /> 
							<input type="file" ref="fileInput" style={{position: "absolute", left: -1000, top: -1000, visibility:"hidden"}} onChange={this.file_Change} />
						</div>
						<div className="small-6 columns">
							{optionalCaption}
						</div>					
					</div>
				</Block>
			);
		}
	});

	var VideoBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onCaptionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, this.props.doc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {

			var optionalCaption = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

			return (
				<Block type="video" blockTypeTitle="Video" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-6 columns text-center">
							<img width="250px" height="250px" src="static/images/not-found.png" />
						</div>
						<div className="small-6 columns">
							{optionalCaption}
						</div>					
					</div>
				</Block>
			);
		},
	});

	var QuestionBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onExpositionChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			// newVal could be a list or a string
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onHintsChange: function(c, oldChildren, newChildren) {
			// newVal must be a list
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.hints = newChildren;

			this.onDocChange(this, oldDoc, newDoc)
		},

		onChoicesChange: function(c, oldChildren, newChildren) {
			// newVal must be a list
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.choices = newChildren;

			this.onDocChange(this, oldDoc, newDoc)
		},

		onAnswerChange: function(c, oldAnswerDoc, newAnswerDoc) {
			// newVal must be a doc
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.answer = newAnswerDoc;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {

			var exposition = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onExpositionChange}/>;
			var optionalHints = <Block type="hints" blockTypeTitle="Hints"><ContentChildren items={this.props.doc.hints || []} encoding={this.encoding} onChange={this.onHintsChange}/></Block>
			
			if (this.props.doc.type == "choiceQuestion" || this.props.doc.type == "isaacMultiChoiceQuestion" || this.props.doc.type == "isaacNumericQuestion" || this.props.doc.type == "isaacSymbolicQuestion")
				var choices = <Block type="choices" blockTypeTitle="Choices"><ContentChildren items={this.props.doc.choices || []} encoding={this.encoding} onChange={this.onChoicesChange} /></Block>

			if (!this.props.doc.answer)
				console.error("Attempting to render question with no answer. This will fail. Content:", this.props.doc);
			return (
				<Block type="question" blockTypeTitle="Question" doc={this.props.doc} onChange={this.onDocChange}>
					{exposition}
					{choices}
					<div className="row">
						<div className="large-6 columns">
							<div className="question-answer"><VariantBlock blockTypeTitle="Answer" doc={this.props.doc.answer} onChange={this.onAnswerChange}/></div>
						</div>
						<div className="large-6 columns">
							{optionalHints}
						</div>
					</div>
				</Block>
			);
		}
	});

	var ContentBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onContentChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			// newVal could be a string or a list.
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {
			if (typeMap[this.props.doc.type] != ContentBlock) {
				return <div className="block type-unknown">[Block of unknown content type: '{this.props.doc.type}']</div>;
			}

			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
					<ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
				</Block>
			);
		}
	});

	var ChoiceBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onContentChange: function(c, oldVal, newVal, oldChildren, newChildren) {
			// newVal could be a string or a list.
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.children = newChildren;

			this.onDocChange(this, oldDoc, newDoc);
		},

		correct_toggle: function(e) {

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);

			newDoc.correct = !oldDoc.correct;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {
			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-1 column text-right">
							{this.props.doc.correct ? 
								<i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> : 
								<i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
						</div>
						<div className="small-11 columns" >
							<ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
						</div>
					</div>
				</Block>
			);
		}
	});

	var UnknownBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		chooseType: function(e) {
			var newDoc = $.extend({}, this.props.doc, generateNewBlock($(e.target).data("chosenType")));

			this.props.onChange(this, this.props.doc, newDoc);
		},

		render: function() {
			return (
				<Block type="unknown" blockTypeTitle="?" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="large-8 large-offset-2 columns text-center">
							Please choose a block type: <br/>
							<a onClick={this.chooseType} data-chosen-type="content">content</a> | 
							<a onClick={this.chooseType} data-chosen-type="question">question</a> | 
							<a onClick={this.chooseType} data-chosen-type="figure">figure</a> |
							<a onClick={this.chooseType} data-chosen-type="video">video</a>
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
				onChange: (function() { console.warn("Called undefined onChange function of block", this.props.doc); }).bind(this),
			};
		},

		getInitialState: function() {
			return {
				mode: "render",
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

		render: function() {
			if (this.state.mode == "render") {
				return (
					<div className={"block type-" + this.props.type}  ref="block">
						<div className="row">
							<div className="large-12 columns">
								<Title onClick={this.onClick} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} title={this.props.blockTypeTitle} />
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

/////////////////////////////////
// Private static fields
/////////////////////////////////

	var typeMap = {
		"image": FigureBlock,
		"figure": FigureBlock,
		"content": ContentBlock,
		"concept": ContentBlock,
		"isaacQuestionPage": ContentBlock,
		"isaacConceptPage": ContentBlock,
		"page": ContentBlock,
		"choice": ChoiceBlock,
		"video": VideoBlock,
		"question": QuestionBlock,
		"choiceQuestion": QuestionBlock,
		"isaacQuestion": QuestionBlock, 
		"isaacMultiChoiceQuestion": QuestionBlock, 
		"isaacNumericQuestion": QuestionBlock, 
		"isaacSymbolicQuestion": QuestionBlock
	};


/////////////////////////////////
// Private static methods
/////////////////////////////////

	function generateNewBlock(type, value) {
		if (!type)
			return {value: value || "_Enter content here_", encoding:"markdown"};

		switch(type) {
			case "question":
				return {
					encoding: "markdown",
					value: "_Enter exposition here_",
					answer: generateNewBlock("content", "_Enter answer here_"),
					type: "question",
			    };
			case "video":
				return {
					encoding: "markdown",
					value: "_Add video caption here_",
					type: "video",
				};
			default:
				return {
					type: type,
					value: value || "_Enter content here_", 
					encoding:"markdown"
				};
		}
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
