/** @jsx React.DOM */
define([
	"react", 
	"jquery", 
	"codemirrorJS", 
	"showdown/showdown", 
	"showdown/extensions/table", 
	"app/MathJaxConfig",
	"jsx!./react_classes/Title",
	"jsx!./react_classes/Tags",
	"jsx!./react_classes/RelatedContent",
	"jsx!./react_classes/MetaData",
	"jsx!./react_classes/ContentValue",
	"jsx!./react_classes/ContentChildren",
	"jsx!./react_classes/JSONEditor",
	"jsx!./react_classes/ContentValueOrChildren",
	"jsx!./react_classes/InsertOp",
	"jsx!./react_classes/DeleteOp",
	"jsx!./react_classes/VariantBlock",
	"jsx!./react_classes/EmailTemplateBlock",
	"jsx!./react_classes/FigureBlock",
	"jsx!./react_classes/VideoBlock",
	"jsx!./react_classes/AnvilAppBlock",
	"jsx!./react_classes/QuestionBlock",
	"jsx!./react_classes/EventPageBlock",
	"jsx!./react_classes/ContentBlock",
	"jsx!./react_classes/ChoiceBlock",
	"jsx!./react_classes/QuantityChoiceBlock",
	"jsx!./react_classes/FormulaChoiceBlock",
	"jsx!./react_classes/ChemicalFormulaChoiceBlock",
	"jsx!./react_classes/TabsBlock",
	"jsx!./react_classes/AccordionBlock",
	"jsx!./react_classes/UnknownBlock",
	"jsx!./react_classes/Block"
	], function(React, $, cmjs, sd, sdt, mjc,
		_Title,
		_Tags,
		_RelatedContent,
		_MetaData,
		_ContentValue,
		_ContentChildren,
		_JSONEditor,
		_ContentValueOrChildren,
		_InsertOp,
		_DeleteOp,
		_VariantBlock,
		_EmailTemplateBlock,
		_FigureBlock,
		_VideoBlock,
		_AnvilAppBlock,
		_QuestionBlock,
		_EventPageBlock,
		_ContentBlock,
		_ChoiceBlock,
		_QuantityChoiceBlock,
		_FormulaChoiceBlock,
		_ChemicalFormulaChoiceBlock,
		_TabsBlock,
		_AccordionBlock,
		_UnknownBlock,
		_Block
	) {

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
// Public static fields
/////////////////////////////////

	ContentEditor.enableMathJax = true;

	ContentEditor.fileLoader = function(path) {
		return new Promise(function(resolve, reject) {
			console.error("No file loader provided for file", path);
			reject();
		});
	};

	ContentEditor.figureUploader = function(fileToUpload, originalName) {
		return new Promise(function(resolve, reject) {
			console.error("No file uploader provided")
			// A real figureUploader would return the path to the uploaded image that can then be loaded with fileLoader
			return reject();
		});
	}

	ContentEditor.getIdList = function() {
		return new Promise(function(resolve, reject) {
			console.error("No ID list provider registered");
			// A real function will resolve to an array of id strings.
			return reject();
		})
	}

	ContentEditor.getTagList = function() {
		return new Promise(function(resolve, reject) {
			console.error("No tag list provider registered");
			// A real function will resolve to an array of tag strings.
			return reject();
		})
	}

	ContentEditor.dateFilter = function(d) {
		return d.toString(); // Replace this with something nicer. Like the angular date filter, for instance.
	}

/////////////////////////////////
// Private static component classes
/////////////////////////////////

	var typeMap = {};

	var Title = _Title(ContentEditor);

	var Tags = _Tags(ContentEditor);

	var RelatedContent = _RelatedContent(ContentEditor);

	var MetaData = _MetaData(ContentEditor, Tags, RelatedContent);

	var JSONEditor = _JSONEditor(ContentEditor);

	var Block = _Block(ContentEditor, typeMap, MetaData, Title, JSONEditor);

    var UnknownBlock = _UnknownBlock(ContentEditor, Block);

    var VariantBlock = _VariantBlock(ContentEditor, typeMap, Block, UnknownBlock);

	var ContentValue = _ContentValue(ContentEditor);

	var InsertOp = _InsertOp(ContentEditor);

	var DeleteOp = _DeleteOp(ContentEditor);

	var ContentChildren = _ContentChildren(ContentEditor, VariantBlock, InsertOp, DeleteOp);

 	var ContentValueOrChildren = _ContentValueOrChildren(ContentEditor, ContentValue, ContentChildren, InsertOp, DeleteOp);

	var TabsBlock = _TabsBlock(ContentEditor, Block, VariantBlock);

	var AccordionBlock = _AccordionBlock(ContentEditor, Block, VariantBlock);

	var EmailTemplateBlock = _EmailTemplateBlock(ContentEditor, Block, ContentValueOrChildren);

	var FigureBlock = _FigureBlock(ContentEditor, Block, ContentValueOrChildren);

	var VideoBlock = _VideoBlock(ContentEditor, Block, ContentValueOrChildren);

	var AnvilAppBlock = _AnvilAppBlock(ContentEditor, Block);

	var QuestionBlock = _QuestionBlock(ContentEditor, Block, VariantBlock, ContentChildren, ContentValueOrChildren, TabsBlock);

	var EventPageBlock = _EventPageBlock(ContentEditor, Block, FigureBlock, ContentValueOrChildren);

	var ContentBlock = _ContentBlock(ContentEditor, typeMap, Block, TabsBlock, AccordionBlock, ContentValueOrChildren);

	var ChoiceBlock = _ChoiceBlock(ContentEditor, Block, ContentBlock, ContentValueOrChildren);

	var QuantityChoiceBlock = _QuantityChoiceBlock(ContentEditor, Block, ContentBlock);

	var FormulaChoiceBlock = _FormulaChoiceBlock(ContentEditor, Block, ContentBlock);

	var ChemicalFormulaChoiceBlock = _ChemicalFormulaChoiceBlock(ContentEditor, Block, ContentBlock);

/////////////////////////////////
// Register Types
/////////////////////////////////

	typeMap["image"] = FigureBlock;
	typeMap["figure"] = FigureBlock;
	typeMap["content"] = ContentBlock;
	typeMap["concept"] = ContentBlock;
	typeMap["isaacQuestionPage"] = ContentBlock;
	typeMap["isaacFastTrackQuestionPage"] = ContentBlock;
	typeMap["isaacConceptPage"] = ContentBlock;
	typeMap["isaacEventPage"] = EventPageBlock;
	typeMap["isaacWildcard"] = ContentBlock;
	typeMap["page"] = ContentBlock;
	typeMap["isaacPageFragment"] = ContentBlock;
	typeMap["choice"] = ChoiceBlock;
	typeMap["quantity"] = QuantityChoiceBlock;
	typeMap["formula"] = FormulaChoiceBlock;
	typeMap["chemicalFormula"] = ChemicalFormulaChoiceBlock;
	typeMap["video"] = VideoBlock;
	typeMap["anvilApp"] = AnvilAppBlock;
	typeMap["question"] = QuestionBlock;
	typeMap["choiceQuestion"] = QuestionBlock;
	typeMap["isaacQuestion"] = QuestionBlock;
	typeMap["isaacMultiChoiceQuestion"] = QuestionBlock;
	typeMap["isaacNumericQuestion"] = QuestionBlock;
	typeMap["isaacSymbolicQuestion"] = QuestionBlock;
	typeMap["isaacSymbolicChemistryQuestion"] = QuestionBlock;
	typeMap["emailTemplate"] = EmailTemplateBlock;


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
