define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Block, VariantBlock, ContentChildren, ContentValueOrChildren, TabsBlock) {
		return React.createClass({

			getInitialState: function() {
				au = this.props.doc.availableUnits || [];
				sy = this.props.doc.availableSymbols || [];
				return {
					significantFiguresMin: this.props.doc.significantFiguresMin,
					significantFiguresMax: this.props.doc.significantFiguresMax,
					title: this.props.doc.title,
					availableUnits: au.join(" | "),
					availableSymbols: sy.join(" , "),
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
				} else if (newType == "isaacMultiChoiceQuestion" && !newDoc.hasOwnProperty("randomiseChoices")) {
					// Add the default value if it is missing
					newDoc.randomiseChoices = true;
				} else {
					// Remove the requireUnits property as it is no longer applicable to this type of question
					delete newDoc.requireUnits;
					// Remove the randomiseChoices property as it is no longer applicable to this type of question
					delete newDoc.randomiseChoices;
				}

				this.onDocChange(this, oldDoc, newDoc);
			},

			onCheckboxChange: function(key, e) {
				console.log("New checkbox state:", e.target.checked, "for key:", key);

				// newVal must be a doc
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
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
                    availableSymbols: newSyms.join(' , ')
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

			render: function() {
				if (this.props.doc.type == "isaacNumericQuestion" && !this.props.doc.hasOwnProperty("requireUnits")) {
					this.props.doc.requireUnits = true;
				} else if (this.props.doc.type == "isaacMultiChoiceQuestion" && !this.props.doc.hasOwnProperty("randomiseChoices")) {
					this.props.doc.randomiseChoices = true;
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
				} else if (this.props.doc.type == "isaacFreeTextQuestion") {
					var requiredChildType = "freeTextRule";
				} else if (this.props.doc.type == "isaacSymbolicLogicQuestion") {
					var requiredChildType = "logicFormula";
				} else if (this.props.doc.type == "isaacSymbolicChemistryQuestion") {
					var requiredChildType = "chemicalFormula";
				} else {
					var requiredChildType = "choice";
				}

				if (["isaacMultiChoiceQuestion", "isaacNumericQuestion", "isaacSymbolicQuestion", "isaacStringMatchQuestion", "isaacFreeTextQuestion", "isaacSymbolicLogicQuestion", "isaacSymbolicChemistryQuestion"].includes(this.props.doc.type))
					var choices = <Block type="choices" blockTypeTitle="Choices">
						<ContentChildren items={this.props.doc.choices || []} encoding={this.encoding} onChange={this.onChoicesChange} requiredChildType={requiredChildType}/>
					</Block>

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

				if (this.props.doc.type == "isaacSymbolicQuestion" || this.props.doc.type == "isaacSymbolicChemistryQuestion") {
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
                        <div className="small-12 columns text-right metasymbolbuttons">
                            {metasymbolsButtons}
                        </div>
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

				return (
					<Block type="question" blockTypeTitle="Question" doc={this.props.doc} onChange={this.onDocChange}>
						<form>
							<div className="row">
								<div className="small-6 columns">
									<input type="text" value={this.state.title} onChange={this.onTitleChange} placeholder="Question title"/>
									<div className="row" style={{display: this.props.doc.type == "isaacNumericQuestion" ? "block" : "none"}}>
										<div className="small-6 columns text-right">
											Significant figures:
										</div>
										<div className="small-1 columns text-right">
											Min
										</div>
										<div className="small-2 columns">
											<input type="text" value={this.state.significantFiguresMin} onChange={this.onSignificantFiguresMinChange}/>
										</div>
										<div className="small-1 columns text-right">
											Max
										</div>
										<div className="small-2 columns">
											<input type="text" value={this.state.significantFiguresMax} onChange={this.onSignificantFiguresMaxChange}/>
										</div>
									</div>
									<div className="row" style={{display: this.props.doc.type == "isaacNumericQuestion" ? "block" : "none"}}>
										<div ref="requireUnitsCheckbox" className="small-6 small-offset-6 columns">
											<label><input type="checkbox" checked={this.props.doc.requireUnits} onChange={this.onCheckboxChange.bind(this, "requireUnits")} />Require Units</label>
										</div>
									</div>
									<div className="row" style={{display: this.props.doc.type == "isaacMultiChoiceQuestion" ? "block" : "none"}}>
										<div ref="randomiseChoicesCheckbox" className="small-6 small-offset-6 columns">
											<label><input type="checkbox" checked={this.props.doc.randomiseChoices} onChange={this.onCheckboxChange.bind(this, "randomiseChoices")} />Randomise Choices</label>
										</div>
									</div>
								</div>
								<div className="small-6 columns">
									<select value={this.props.doc.type} onChange={this.type_Change}>
										<option value="isaacQuestion">Quick Question</option>
										<option value="isaacMultiChoiceQuestion">Multiple Choice Question</option>
										<option value="isaacNumericQuestion">Numeric Question</option>
										<option value="isaacSymbolicQuestion">Symbolic Question</option>
										<option value="isaacStringMatchQuestion">String Match Question</option>
										<option value="isaacFreeTextQuestion">Free Text Question</option>
										<option value="isaacSymbolicLogicQuestion">Logic Question</option>
										<option value="isaacSymbolicChemistryQuestion">Chemistry Question</option>
									</select>
								</div>
							</div>
						</form>
						{unitsList}
						{symbolsList}
						{formulaSeed}
						{exposition}
						{choices}
						{freeTextHelpTable}
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
