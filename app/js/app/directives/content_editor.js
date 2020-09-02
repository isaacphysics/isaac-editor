/** @jsx React.DOM */
define([
	"react",
	"jquery",
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
	"jsx!./react_classes/PodBlock",
	"jsx!./react_classes/FigureBlock",
	"jsx!./react_classes/VideoBlock",
	"jsx!./react_classes/AnvilAppBlock",
	"jsx!./react_classes/QuestionBlock",
	"jsx!./react_classes/EventPageBlock",
	"jsx!./react_classes/ContentBlock",
	"jsx!./react_classes/ChoiceBlock",
	"jsx!./react_classes/StringChoiceBlock",
	"jsx!./react_classes/FreeTextRuleBlock",
	"jsx!./react_classes/QuantityChoiceBlock",
	"jsx!./react_classes/FormulaChoiceBlock",
	"jsx!./react_classes/LogicFormulaChoiceBlock",
	"jsx!./react_classes/ParsonsChoiceBlock",
	"jsx!./react_classes/ParsonsItemBlock",
	"jsx!./react_classes/ChemicalFormulaChoiceBlock",
    "jsx!./react_classes/GraphSketcherChoiceBlock",
	"jsx!./react_classes/TabsBlock",
	"jsx!./react_classes/AccordionBlock",
	"jsx!./react_classes/UnknownBlock",
	"jsx!./react_classes/Block",
	"jsx!./react_classes/GlossaryTermBlock"
	], function(React, $, mjc,
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
		_PodBlock,
		_FigureBlock,
		_VideoBlock,
		_AnvilAppBlock,
		_QuestionBlock,
		_EventPageBlock,
		_ContentBlock,
		_ChoiceBlock,
		_StringChoiceBlock,
		_FreeTextRuleBlock,
		_QuantityChoiceBlock,
		_FormulaChoiceBlock,
		_LogicFormulaChoiceBlock,
		_ParsonsChoiceBlock,
		_ParsonsItemBlock,
		_ChemicalFormulaChoiceBlock,
		_GraphSketcherChoiceBlock,
		_TabsBlock,
		_AccordionBlock,
		_UnknownBlock,
		_Block,
		_GlossaryTermBlock
	) {

/////////////////////////////////
// Constructor
/////////////////////////////////

	function ContentEditor(container, document) {
		console.log("Loading doc into JSON editor:", document);
		if (document.id) {
			window.document.title = document.id + " - Isaac Content Editor";
		}
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

	var PodBlock = _PodBlock(ContentEditor, Block, FigureBlock);

	var VideoBlock = _VideoBlock(ContentEditor, Block, ContentValueOrChildren);

	var AnvilAppBlock = _AnvilAppBlock(ContentEditor, Block);

	var EventPageBlock = _EventPageBlock(ContentEditor, Block, FigureBlock, ContentValueOrChildren);

	var ContentBlock = _ContentBlock(ContentEditor, typeMap, Block, TabsBlock, AccordionBlock, ContentValueOrChildren);

	var ChoiceBlock = _ChoiceBlock(ContentEditor, Block, ContentBlock, ContentValueOrChildren);

	var StringChoiceBlock = _StringChoiceBlock(ContentEditor, Block, ContentBlock, ContentValueOrChildren);

	var FreeTextRuleBlock = _FreeTextRuleBlock(ContentEditor, Block, ContentBlock, ContentValueOrChildren);

	var QuantityChoiceBlock = _QuantityChoiceBlock(ContentEditor, Block, ContentBlock);

	var FormulaChoiceBlock = _FormulaChoiceBlock(ContentEditor, Block, ContentBlock);

	var LogicFormulaChoiceBlock = _LogicFormulaChoiceBlock(ContentEditor, Block, ContentBlock);

	var GraphSketcherChoiceBlock = _GraphSketcherChoiceBlock(ContentEditor, Block, ContentBlock);

	var ParsonsItemBlock = _ParsonsItemBlock(ContentEditor, Block, ContentBlock);

	var ParsonsChoiceBlock = _ParsonsChoiceBlock(ContentEditor, Block, ContentBlock, ParsonsItemBlock);

	var ChemicalFormulaChoiceBlock = _ChemicalFormulaChoiceBlock(ContentEditor, Block, ContentBlock);

	var QuestionBlock = _QuestionBlock(ContentEditor, Block, VariantBlock, ContentChildren, ContentValueOrChildren, TabsBlock, ParsonsItemBlock, ParsonsChoiceBlock);

	var GlossaryTermBlock = _GlossaryTermBlock(ContentEditor, Block, Tags, ContentBlock);

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
	typeMap["isaacTopicSummaryPage"] = ContentBlock;
	typeMap["isaacEventPage"] = EventPageBlock;
	typeMap["isaacWildcard"] = ContentBlock;
	typeMap["page"] = ContentBlock;
	typeMap["isaacPageFragment"] = ContentBlock;
	typeMap["choice"] = ChoiceBlock;
	typeMap["stringChoice"] = StringChoiceBlock;
	typeMap["freeTextRule"] = FreeTextRuleBlock;
	typeMap["quantity"] = QuantityChoiceBlock;
	typeMap["formula"] = FormulaChoiceBlock;
	typeMap["chemicalFormula"] = ChemicalFormulaChoiceBlock;
	typeMap["logicFormula"] = LogicFormulaChoiceBlock;
	typeMap["graphChoice"] = GraphSketcherChoiceBlock;
	typeMap["parsonsChoice"] = ParsonsChoiceBlock;
	typeMap["itemChoice"] = ParsonsChoiceBlock;
	typeMap["parsonsItem"] = ParsonsItemBlock;
	typeMap["video"] = VideoBlock;
	typeMap["anvilApp"] = AnvilAppBlock;
	typeMap["question"] = QuestionBlock;
	typeMap["choiceQuestion"] = QuestionBlock;
	typeMap["isaacQuestion"] = QuestionBlock;
	typeMap["isaacMultiChoiceQuestion"] = QuestionBlock;
	typeMap["isaacNumericQuestion"] = QuestionBlock;
	typeMap["isaacSymbolicQuestion"] = QuestionBlock;
	typeMap["isaacGraphSketcherQuestion"] = QuestionBlock;
	typeMap["isaacStringMatchQuestion"] = QuestionBlock;
	typeMap["isaacFreeTextQuestion"] = QuestionBlock;
	typeMap["isaacSymbolicChemistryQuestion"] = QuestionBlock;
	typeMap["isaacSymbolicLogicQuestion"] = QuestionBlock;
	typeMap["isaacItemQuestion"] = QuestionBlock;
	typeMap["isaacParsonsQuestion"] = QuestionBlock;
	typeMap["emailTemplate"] = EmailTemplateBlock;
	typeMap["isaacPod"] = PodBlock;
	typeMap["glossaryTerm"] = GlossaryTermBlock;


/////////////////////////////////
// Private instance methods
/////////////////////////////////

	// Must be called with 'this' bound to the instance.
	function docChanged(c, oldDoc, newDoc) {
		console.log("Document changed:", newDoc);

		if (oldDoc.id !== newDoc.id) {
			window.document.title = newDoc.id + " - Isaac Content Editor";
		}
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
