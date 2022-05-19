define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, VariantBlock, ContentChildren, ContentValue, ContentValueOrChildren, TabsBlock, ParsonsItemBlock, ParsonsChoiceBlock) {
		return React.createClass({

			getInitialState: function() {
				au = this.props.doc.availableUnits || [];
				sy = this.props.doc.availableSymbols || [];
				return {
					significantFiguresMin: this.props.doc.significantFiguresMin,
					significantFiguresMax: this.props.doc.significantFiguresMax,
					title: this.props.doc.title,
					availableUnits: au.map(u => u.trim()).join(" | "),
					availableSymbols: sy.map(s => s.trim()).join(" , "),
					formulaSeed: this.props.doc.formulaSeed,
				}
			},

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

			onHintsChange: function(c, oldHintsDoc, newHintsDoc) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.hints = newHintsDoc.children;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onParsonsItemsChange: function(c, oldChildren, newChildren) {
				// newVal must be a list
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.items[c.props.key] = newChildren;

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

			onDefaultFeedbackChange: function(e, oldDefaultFeedbackChildren, newDefaultFeedbackChildren) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);

				if (!newDefaultFeedbackChildren || newDefaultFeedbackChildren.length === 0) {
					delete newDoc.defaultFeedback;
				} else {
					newDoc.defaultFeedback = {
						"type": "content",
						"children": newDefaultFeedbackChildren,
						"encoding": "markdown"
					};
				}

				this.onDocChange(this, oldDoc, newDoc);
			},

			onSignificantFiguresMinChange: function(e) {

				this.setState({
					significantFiguresMin: e.target.value
				});

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.significantFiguresMin = parseInt(e.target.value);

				this.onDocChange(this, oldDoc, newDoc);
			},

			onSignificantFiguresMaxChange: function(e) {

				this.setState({
					significantFiguresMax: e.target.value
				});

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.significantFiguresMax = parseInt(e.target.value);

				this.onDocChange(this, oldDoc, newDoc);
			},

			onDisplayUnitChange: function(e) {

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				if (!e.target.value.replace(/\s/g, '').length) {
					newDoc.displayUnit = null;
				} else {
					newDoc.displayUnit = e.target.value;
					newDoc.requireUnits = false;
				}

				this.onDocChange(this, oldDoc, newDoc);
			},


			onTitleChange: function(e) {

				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.title = e.target.value;

				this.onDocChange(this, oldDoc, newDoc);
			},

			type_Change: function(event) {
				var newType = event.target.value;

				// newVal must be a doc
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.type = newType;
				if (newType == "isaacNumericQuestion" && !newDoc.hasOwnProperty("requireUnits")) {
					// Add the default value if it is missing
					newDoc.requireUnits = true;
					newDoc.displayUnit = null;
					newDoc.disregardSignificantFigures = false;
					delete newDoc.showConfidence;
					delete newDoc.randomiseChoices;
				} else if (newType == "isaacQuestion" && !newDoc.hasOwnProperty("showConfidence")) {
					newDoc.showConfidence = false;
					delete newDoc.requireUnits
					delete newDoc.disregardSignificantFigures
					delete newDoc.displayUnit;
					delete newDoc.randomiseChoices
				} else if (newType == "isaacMultiChoiceQuestion" && !newDoc.hasOwnProperty("randomiseChoices")) {
					// Add the default value if it is missing
					newDoc.randomiseChoices = true;
					delete newDoc.requireUnits
					delete newDoc.disregardSignificantFigures
					delete newDoc.displayUnit;
					delete newDoc.showConfidence
				} else {
					// Remove the requireUnits property as it is no longer applicable to this type of question
					delete newDoc.requireUnits;
					// Remove the disregardSignificantFigures property as it is no longer applicable to this type of question
					delete newDoc.disregardSignificantFigures;
					// Remove the displayUnit property as it is no longer applicable to this type of question
					delete newDoc.displayUnit;
					// Remove the randomiseChoices property as it is no longer applicable to this type of question
					delete newDoc.randomiseChoices;
					// Remove showConfidence property as it is no longer applicable to this type of question
					delete newDoc.showConfidence;
				}

				if (newType != "isaacQuestion" && !newDoc.hasOwnProperty("defaultFeedback")) {
					newDoc.defaultFeedback = null;
				} else {
					// Remove the defaultFeedback property as it is not applicable to quick questions
					delete newDoc.defaultFeedback;
				}

				this.onDocChange(this, oldDoc, newDoc);
			},

			onCheckboxChange: function(key, e) {
				console.log("New checkbox state:", e.target.checked, "for key:", key);

				// newVal must be a doc
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				if (key === "requireUnits" && e.target.checked) {
					newDoc["displayUnit"] = null;
				}
				newDoc[key] = e.target.checked;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onRandomiseChoicesChange: function(e) {
				console.log("Randomise choices: ", e.target.checked);

				// newVal must be a doc
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.randomiseChoices = e.target.checked;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onAvailableUnitsChange: function(e) {
				this.setState({
					availableUnits: e.target.value,
				});

				clearTimeout(this.availableUnitsCommitTimeout);
				this.availableUnitsCommitTimeout = setTimeout(function() {
					// newVal must be a doc
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, oldDoc);
					newDoc.availableUnits = this.state.availableUnits.split("|");

					this.onDocChange(this, oldDoc, newDoc);
				}.bind(this), 500);
			},

			onAvailableSymbolsChange: function(e) {
				this.setState({
					availableSymbols: e.target.value,
				});

				clearTimeout(this.availableSymbolsCommitTimeout);
				this.availableSymbolsCommitTimeout = setTimeout(function() {
				    this.updateAvailableMetaSymbolButtonStatus(this);
					// newVal must be a doc
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, oldDoc);
					newDoc.availableSymbols = this.state.availableSymbols.split(",");

					this.onDocChange(this, oldDoc, newDoc);
				}.bind(this), 500);
			},

            availableMetaSymbols: [
                ['_trigs',          'Trigs'],
                ['_1/trigs',        '1/Trigs'],
                ['_inv_trigs',      'Inv Trigs'],
                ['_inv_1/trigs',    'Inv 1/Trigs'],
                ['_hyp_trigs',      'Hyp Trigs'],
                ['_inv_hyp_trigs',  'Inv Hyp Trigs'],
                ['_logs',           'Logarithms'],
                ['_no_alphabet',    'No Alphabet']
            ],

            onAvailableMetaSymbolsChange: function(e) {
			    t = jQuery(e.target);
                let syms = this.state.availableSymbols.split(',').map(s => s.trim());
                let newSyms = [];
                if (syms.indexOf(t.data('metasymbol')) > -1) {
                    // Remove and turn off
                    newSyms = syms.reduce((a,b) => b === t.data('metasymbol') ? a : a.concat(b), []);
                    t.removeClass('primary').addClass('secondary');
                } else {
                    // Add and turn on
                    newSyms = syms.concat(t.data('metasymbol'));
                    t.removeClass('secondary').addClass('primary');
                }
                this.setState({
                    availableSymbols: newSyms.map(s => s.trim()).join(' , ')
                });
                let oldDoc = this.props.doc;
                let newDoc = jQuery.extend({}, oldDoc);
                newDoc.availableSymbols = newSyms;

                this.onDocChange(this, oldDoc, newDoc);
            },

            updateAvailableMetaSymbolButtonStatus: (_this) => {
                let buttons = jQuery.find('.metasymbolbuttons button');
                buttons.forEach(b => {
                    let metasymbol = jQuery(b).data('metasymbol');
                    if (_this.state.availableSymbols.split(",").map(s => s.trim()).indexOf(metasymbol) > -1) {
                        jQuery(b).removeClass('secondary').addClass('primary');
                    } else {
                        jQuery(b).removeClass('primary').addClass('secondary');
                    }
                });
            },

			onFormulaSeedChange: function(e) {
				this.setState({
					formulaSeed: e.target.value,
				});

				clearTimeout(this.formulaSeedCommitTimeout);
				this.formulaSeedCommitTimeout = setTimeout(function() {
					// newVal must be a doc
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, oldDoc);
					newDoc.formulaSeed = this.state.formulaSeed;

					this.onDocChange(this, oldDoc, newDoc);
				}.bind(this), 500);
			},

			addParsonsItem: function() {
				if (this.props.doc.items !== undefined) {
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, oldDoc);
					var newItem = {
						"type": { "isaacParsonsQuestion": "parsonsItem", "isaacClozeQuestion": "item", "isaacItemQuestion" : "item" }[this.props.doc.type],
						"value": "",
						"id": Math.random().toString(16).toLowerCase().slice(-4)
					};
					if (this.props.doc.type === "isaacParsonsQuestion") {
						newItem["indentation"] = 0;
					}
					newDoc.items.push(newItem);
					this.onDocChange(this, oldDoc, newDoc);
				}
			},

			removeParsonsItemAtIndex: function(index) {
				if (this.props.doc.items.hasOwnProperty(index)) {
					var oldDoc = this.props.doc;
					var newDoc = $.extend({}, oldDoc);
					newDoc.items.splice(index, 1);

					this.onDocChange(this, oldDoc, newDoc);
				}
			},

			render: function() {
				if (this.props.doc.type == "isaacNumericQuestion" && !this.props.doc.hasOwnProperty("requireUnits")) {
					this.props.doc.requireUnits = true;
				} else if (this.props.doc.type == "isaacQuestion" && !this.props.doc.hasOwnProperty("showConfidence")) {
					this.props.doc.showConfidence = false;
				} else if (this.props.doc.type == "isaacMultiChoiceQuestion" && !this.props.doc.hasOwnProperty("randomiseChoices")) {
					this.props.doc.randomiseChoices = true;
				} else if ((this.props.doc.type == "isaacParsonsQuestion" || this.props.doc.type == "isaacClozeQuestion" || this.props.doc.type == "isaacItemQuestion") && !this.props.doc.items) {
					this.props.doc.items = [];
				}

				if (this.props.doc.type == "isaacClozeQuestion") {
					if (!this.props.doc.hasOwnProperty("randomiseItems")) {
						this.props.doc.randomiseItems = false;
					}
				}

				var hints = {
					"type": "content",
					"layout": "tabs",
					"children": this.props.doc.hints || []
				};

				var exposition = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onExpositionChange}/>;
				if (this.props.doc.type != "isaacQuestion") {
					var optionalHints = <Block type="hints" blockTypeTitle="Hints">
						<TabsBlock doc={hints} onChange={this.onHintsChange} allowTabTitles="false"/>
					</Block>
				}

				if (this.props.doc.type == "isaacNumericQuestion") {
					var requiredChildType = "quantity";
				} else if (this.props.doc.type == "isaacSymbolicQuestion") {
					var requiredChildType = "formula";
				} else if (this.props.doc.type == "isaacStringMatchQuestion") {
					var requiredChildType = "stringChoice";
				} else if (this.props.doc.type == "isaacRegexMatchQuestion") {
					var requiredChildType = "regexPattern";
				} else if (this.props.doc.type == "isaacFreeTextQuestion") {
					var requiredChildType = "freeTextRule";
				} else if (this.props.doc.type == "isaacSymbolicLogicQuestion") {
					var requiredChildType = "logicFormula";
				} else if (this.props.doc.type == "isaacItemQuestion") {
					var requiredChildType = "itemChoice";
				} else if (this.props.doc.type == "isaacParsonsQuestion") {
					var requiredChildType = "parsonsChoice";
				} else if (this.props.doc.type == "isaacClozeQuestion") {
					var requiredChildType = "itemChoice";
				} else if (this.props.doc.type == "isaacSymbolicChemistryQuestion") {
					var requiredChildType = "chemicalFormula";
                } else if (this.props.doc.type == "isaacGraphSketcherQuestion") {
					var requiredChildType = "graphChoice";
				} else {
					var requiredChildType = "choice";
				}

				if (["isaacMultiChoiceQuestion", "isaacNumericQuestion", "isaacSymbolicQuestion", "isaacStringMatchQuestion", "isaacRegexMatchQuestion", "isaacFreeTextQuestion", "isaacGraphSketcherQuestion", "isaacSymbolicLogicQuestion", "isaacSymbolicChemistryQuestion"].includes(this.props.doc.type)) {
					var choices = <Block type="choices" blockTypeTitle="Choices">
						<ContentChildren items={this.props.doc.choices || []} encoding={this.encoding} onChange={this.onChoicesChange} requiredChildType={requiredChildType}/>
					</Block>
				} else if (this.props.doc.type === "isaacParsonsQuestion" || this.props.doc.type === "isaacItemQuestion" || this.props.doc.type === "isaacClozeQuestion") {
					var choices = <Block type="choices" blockTypeTitle="Choices">
						<ContentChildren globalItems={this.props.doc.items || []} items={this.props.doc.choices || []} encoding={this.encoding} onChange={this.onChoicesChange} requiredChildType={requiredChildType}/>
					</Block>
				}

				if (!this.props.doc.answer) {
					console.error("Attempting to render question with no answer. This will fail. Content:", this.props.doc);
				}

				if (this.props.doc.type == "isaacNumericQuestion" && this.props.doc.requireUnits) {
					var unitsList = <div className="row">
						<div className="small-3 columns text-right">
							Available units:
						</div>
						<div className="small-9 columns">
							<input type="text" placeholder="Enter list of units here (|-separated)" value={this.state.availableUnits} onChange={this.onAvailableUnitsChange} />
						</div>
					</div>;
				}

				if (this.props.doc.type == "isaacSymbolicQuestion" || this.props.doc.type == "isaacSymbolicChemistryQuestion" || this.props.doc.type == 'isaacSymbolicLogicQuestion') {
				    var metasymbolsButtons = this.availableMetaSymbols.map((item) => {
                        let symbols = this.state.availableSymbols.split(',').map(s => s.trim());
                        let _class = symbols.indexOf(item[0]) > -1 ? 'primary' : 'secondary';
                        return <span>&nbsp;
                            <button key={item[0]} data-metasymbol={item[0]} onClick={this.onAvailableMetaSymbolsChange} className={`button tiny ${_class} radius`}>
                                {item[1]}
                            </button>
                        </span>;
                    });

					var symbolsList = <div className="row">
						<div className="small-3 columns text-right">
							Available symbols:
						</div>
						<div className="small-9 columns">
							<input type="text" placeholder="Enter list of symbols here (,-separated)" value={this.state.availableSymbols} onChange={this.onAvailableSymbolsChange} />
						</div>
                        {this.props.doc.type != 'isaacSymbolicLogicQuestion' && <div className="small-12 columns text-right metasymbolbuttons">
                            {metasymbolsButtons}
                        </div>}
					</div>;
				}

				if (this.props.doc.type == "isaacSymbolicQuestion" || this.props.doc.type == "isaacSymbolicChemistryQuestion" || this.props.doc.type == "isaacSymbolicLogicQuestion") {
					var formulaSeed = <div className="row">
						<div className="small-3 columns text-right">
							Editor seed:
						</div>
						<div className="small-9 columns">
							<input type="text" placeholder="Enter initial state here" value={this.state.formulaSeed} onChange={this.onFormulaSeedChange} />
						</div>
					</div>;
				}

				if (this.props.doc.type == "isaacFreeTextQuestion") {
					var freeTextHelpTable =
					<div>
					<h5>Matching Rule Syntax:</h5>
					<p>⚠️ A fuller set of instructions can be found <a href="https://github.com/isaacphysics/rutherford-content/wiki/Editor-Notes#free-text-questions" target="_">here</a>.</p>
					<table className="table table-striped table-bordered">
						<thead><tr><th>Symbol</th><th>Description</th><th>Rule</th><th>✔️ Match</th><th>❌ Failed Match</th></tr></thead>
						<tbody>
							<tr>  <td style={{"text-align": "center"}}><code>|</code></td>  <td>Separate an OR list of word choices</td>  <td style={{"white-space": "nowrap"}}><code>JavaScript|[Java&nbsp;Script]|JS</code></td>  <td>"JavaScript", "Java Script", "JS"</td>         <td>"Java"</td>                                             </tr>
							<tr>  <td style={{"text-align": "center"}}><code>.</code></td>  <td>Match only one character</td>             <td style={{"text-align": "center"}}><code>.a.b.</code></td>                              <td>"XaXbX"</td>                                   <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ", "XbXaX"</td>  </tr>
							<tr>  <td style={{"text-align": "center"}}><code>*</code></td>  <td>Match zero or more characters</td>        <td style={{"text-align": "center"}}><code>*a*b*</code></td>                              <td>"ab", "Xab", "aXb", "abX", "XYZaXYZbXYZ"</td>  <td>"ba", "XbXaX"</td>                                      </tr>
						</tbody>
					</table>
					</div>;
				}

				if (this.props.doc.type == "isaacParsonsQuestion" || this.props.doc.type == "isaacItemQuestion" || this.props.doc.type == "isaacClozeQuestion") {
					var parsonsItemsListItems = [];
					for (const index in this.props.doc.items) {
						const element = this.props.doc.items[index];
						const div = (<div>
							<Block key={index}>
								<ParsonsItemBlock doc={element} key={index} mode="item" onChange={this.onParsonsItemsChange} onRemoveClicked={this.removeParsonsItemAtIndex} />
							</Block>
						</div>);
						parsonsItemsListItems.push(div);
					}

					var parsonsItemsList = <div>
						<div className="row">
							<div className="small-2 column">ID</div>
							<div className="small-8 columns end">Value</div>
						</div>

						{parsonsItemsListItems}

						<div className="row">
							<div className="small-2 column">&nbsp;</div>
							<div className="small-8 columns">&nbsp;</div>
							<div className="small-1 column end">
								<button className={"button tiny tag radius success"} onClick={this.addParsonsItem}><i className="foundicon-plus" /></button>
							</div>
						</div>
					</div>
				}

				if (this.props.doc.type === "isaacClozeQuestion") {
					var clozeDndHelp = <div style={{marginBottom: "10px"}}>
						<h3>Defining drop zones</h3>
						<p>To place drop zones within question text, write [drop-zone] (with the square brackets) - this will then get replaced with a drop zone UI element when the question is rendered. If you want to place drop zones within LaTeX, escape it with the <code>\text</code> environment (but see disclaimer)</p>
						<p>For the drop zones to work correctly, the question exposition must be HTML encoded - if you would like to use markdown please use a <a href={"https://markdowntohtml.com/"}>markdown to HTML converter</a>.</p>
						<small>Disclaimer: drop zones will work in LaTeX for simple use cases, but for very complex and/or nested equations may not work as intended - in summary drop zones in LaTeX are not explicitly supported by us, but it can work for <em>most</em> use cases</small>
					</div>
				}

				if (this.props.doc.type != "isaacQuestion") {
					var defaultFeedback = <Block type="content" blockTypeTitle="Default Feedback">
						<ContentChildren items={(this.props.doc.defaultFeedback && this.props.doc.defaultFeedback.children) || []} encoding="markdown" onChange={this.onDefaultFeedbackChange} />
					</Block>;
				}

				return (
					<Block type="question" blockTypeTitle="Question" doc={this.props.doc} onChange={this.onDocChange}>
						<form>
							<div className="row">
								<div className="small-6 columns">
									<input type="text" value={this.props.doc.title || ""} onChange={this.onTitleChange} placeholder="Question title"/>
								</div>
								<div className="small-6 columns">
									<select value={this.props.doc.type} onChange={this.type_Change}>
										<option value="isaacQuestion">Quick Question</option>
										<option value="isaacMultiChoiceQuestion">Multiple Choice Question</option>
										<option value="isaacNumericQuestion">Numeric Question</option>
										<option value="isaacSymbolicQuestion">Symbolic Question</option>
										<option value="isaacStringMatchQuestion">String Match Question</option>
										<option value="isaacRegexMatchQuestion">Regex Match Question</option>
										<option value="isaacFreeTextQuestion">Free Text Question</option>
										<option value="isaacSymbolicLogicQuestion">Logic Question</option>
										<option value="isaacItemQuestion">Item Question</option>
										<option value="isaacParsonsQuestion">Parsons Question</option>
										<option value="isaacClozeQuestion">Cloze (Drag and Drop) Question</option>
										<option value="isaacSymbolicChemistryQuestion">Chemistry Question</option>
										<option value="isaacGraphSketcherQuestion">Graph Sketcher Question</option>
									</select>
								</div>
								<div className="row">
									<div className="row" style={{display: this.props.doc.type == "isaacNumericQuestion" ? "block" : "none"}}>
										<div className="small-3 columns text-right">
											Significant figures:
										</div>
										<div className="small-2 columns">
											<input type="text" placeholder="Min" value={this.state.significantFiguresMin} onChange={this.onSignificantFiguresMinChange}/>
										</div>
										<div className="small-1 columns">
											to
										</div>
										<div className="small-2 columns">
											<input type="text" placeholder="Max" value={this.state.significantFiguresMax} onChange={this.onSignificantFiguresMaxChange}/>
										</div>
										<div className="small-1 columns">
											OR
										</div>
										<div ref="disregardSigFigsCheckbox" className="small-3 columns">
											<label><input type="checkbox" checked={this.props.doc.disregardSignificantFigures} onChange={this.onCheckboxChange.bind(this, "disregardSignificantFigures")} />Exact answers only</label>
										</div>
									</div>
									<div className="row" style={{display: this.props.doc.type == "isaacNumericQuestion" ? "block" : "none"}}>
										<div className="small-3 columns text-right">
											Display unit:
										</div>
										<div className="small-3 columns">
											<input type="text" value={this.props.doc.displayUnit} onChange={this.onDisplayUnitChange}/>
										</div>
										<div className="small-1 columns">
											OR
										</div>
										<div ref="requireUnitsCheckbox" className="small-5 columns">
											<label><input type="checkbox" checked={this.props.doc.requireUnits} onChange={this.onCheckboxChange.bind(this, "requireUnits")} />Require choice of units</label>
										</div>
									</div>
									<div className="row" style={{display: this.props.doc.type == "isaacQuestion" ? "block" : "none"}}>
										<div ref="showConfidenceCheckbox" className="small-5 columns">
											<label><input type="checkbox" checked={this.props.doc.showConfidence} onChange={this.onCheckboxChange.bind(this, "showConfidence")} />Show confidence question</label>
										</div>
									</div>

									<div className="row" style={{display: this.props.doc.type == "isaacMultiChoiceQuestion" ? "block" : "none"}}>
										<div ref="randomiseChoicesCheckbox" className="small-6 small-offset-6 columns">
											<label><input type="checkbox" checked={this.props.doc.randomiseChoices} onChange={this.onCheckboxChange.bind(this, "randomiseChoices")} />Randomise Choices</label>
										</div>
									</div>
									<div className="row" style={{display: this.props.doc.type in ["isaacStringMatchQuestion", "isaacRegexMatchQuestion"] ? "block" : "none"}}>
										<div ref="multiLineCheckbox" className="small-6 small-offset-6 columns">
											<input type="checkbox" checked={this.props.doc.multiLineEntry} onChange={this.onCheckboxChange.bind(this, "multiLineEntry")} /> Multi-line
										</div>
									</div>
									<div className="row" style={{display: this.props.doc.type === "isaacParsonsQuestion" ? "block" : "none"}}>
										<div ref="disableIndentationCheckbox" className="small-6 columns">
											<label><input type="checkbox" checked={this.props.doc.disableIndentation} onChange={this.onCheckboxChange.bind(this, "disableIndentation")} /> Disable indentation</label>
										</div>
									</div>
								</div>
								<div className="row" style={{display: this.props.doc.type == "isaacClozeQuestion" ? "block" : "none"}}>
									<div ref="withReplacementCheckbox" className="small-6 small-offset-6 columns">
										<label><input type="checkbox" checked={this.props.doc.withReplacement} onChange={this.onCheckboxChange.bind(this, "withReplacement")} /> Allow items to be used more than once</label>
									</div>
								</div>
								<div className="row" style={{display: this.props.doc.type == "isaacClozeQuestion" ? "block" : "none"}}>
									<div ref="randomiseItemsCheckbox" className="small-6 small-offset-6 columns">
										<label><input type="checkbox" checked={this.props.doc.randomiseItems} onChange={this.onCheckboxChange.bind(this, "randomiseItems")} />Randomise items on question load</label>
									</div>
								</div>
							</div>
						</form>
						{unitsList}
						{symbolsList}
						{formulaSeed}
						{exposition}
						{parsonsItemsList}
						{choices}
						{freeTextHelpTable}
						{clozeDndHelp}
						<div className="row">
							<div className="large-12 columns">
								{defaultFeedback}
							</div>
						</div>
						<div className="row">
							<div className="large-12 columns">
								<div className="question-answer"><VariantBlock blockTypeTitle="Answer" doc={this.props.doc.answer} onChange={this.onAnswerChange}/></div>
							</div>
						</div>
						<div className="row">
							<div className="large-12 columns">
									{optionalHints}
							</div>
						</div>
					</Block>
				);
			}
		});
	}
})
