define(["react"], function(React) {
    var tinyBtnCls = "button tiny secondary radius";
    var tinyBtnCSS = {padding: "0.5rem", background: "none", border: "solid 1px lightgrey"};
    var actionBtnCls = "button tiny radius";
    var selectCSS = {"width": "auto", "padding-right": "1rem"};

    var phyStages = ["university", "further_a", "a_level", "gcse", "year_9", "year_8", "year_7"];
    var difficulties = ["practice_1", "practice_2", "practice_3", "challenge_1", "challenge_2", "challenge_3"];

    var csStages = ["a_level", "gcse"];
    var csExamBoards = ["aqa", "ocr", "cie", "edexcel", "eduqas", "wjec"];
    var csStagedExamBoards = {
        "a_level": ["aqa", "cie", "eduqas", "ocr", "wjec"],
        "gcse": ["aqa", "edexcel", "eduqas", "ocr", "wjec"],
    };
    function allExamBoardsForStagePresent(fieldsObject) {
        if (Object.keys(fieldsObject).indexOf("examBoard") === -1) return false;
        if (Object.keys(fieldsObject).indexOf("stage") === -1) return false;
        if (fieldsObject["stage"].length !== 1) return false;
        var possibleExamBoards = csStagedExamBoards[fieldsObject["stage"]] || [];
        if (possibleExamBoards.length !== fieldsObject["examBoard"].length) return false;
        return possibleExamBoards.every(examBoard => fieldsObject["examBoard"].indexOf[examBoard] !== -1);
    }



    var roles = ["logged_in", "teacher"]; //, "event_leader", "content_editor", "event_manager", "admin"];

    return function(ContentEditor) {
        return React.createClass({
            getDefaultFieldsObject: function() {
                return {"stage": ["a_level"]};
            },

            getPossibleFields: function() {
                if (ContentEditor.SITE_SUBJECT === "CS") {
                    switch (this.state.componentLevel) {
                        case "document": return {stage: csStages, examBoard: csExamBoards, difficulty: difficulties};
                        case "accordion": return {stage: csStages, examBoard: csExamBoards, role: roles};
                    }
                } else { //if (ContentEditor.SITE_SUBJECT === "PHY") OR default
                    switch (this.state.componentLevel) {
                        case "document": return {stage: phyStages, difficulty: difficulties};
                        case "accordion": return {stage: phyStages};
                    }
                }
            },

            getRemainingFieldsAndValue: function(existingFieldsObject) {
                return Object.entries(this.getPossibleFields())
                    .filter(fieldsEntry => Object.keys(existingFieldsObject).indexOf(fieldsEntry[0]) === -1)
                    .map(fieldsEntry => [fieldsEntry[0], fieldsEntry[1].slice(0, 1)]);
            },

            getRemainingValues: function(fieldsObject, fieldName, existingValues) {
                return (this.getPossibleFields()[fieldName] || [])
                    .filter(function filterExamBoardOptionsByStageIfApplicable(value) {
                        if (ContentEditor.SITE_SUBJECT !== "CS" || fieldName !== "examBoard") return true;
                        if (Object.keys(fieldsObject).indexOf("stage") === -1) return true;
                        if (fieldsObject["stage"].length !== 1) return true;
                        return (csStagedExamBoards[fieldsObject["stage"][0]] || []).indexOf(value) !== -1;
                    })
                    .filter(possibleValue => existingValues.indexOf(possibleValue) === -1);
            },

            getInitialState: function() {
                return {
                    componentLevel: this.props.accordion ? "accordion" : "document",
                    localAudience: this.props.audience || [this.getDefaultFieldsObject()],
                    editing: false,
                };
            },


            addNewFieldsObject: function() {
                this.setState({localAudience: this.state.localAudience.concat([this.getDefaultFieldsObject()])})
            },

            removeFieldsObject: function(fieldsObjectIndex) {
                return function() {
                    this.setState({localAudience: this.state.localAudience.filter((fieldsObject, index) => index !== fieldsObjectIndex)});
                }.bind(this);
            },


            addFieldToFieldsObject: function(fieldsObjectIndex) {
                return function() {
                    var fieldObject = this.state.localAudience[fieldsObjectIndex];
                    var newFieldObject = Object.assign({}, fieldObject);
                    var aRemainingFieldAndValue = this.getRemainingFieldsAndValue(fieldObject)[0];
                    newFieldObject[aRemainingFieldAndValue[0]] = aRemainingFieldAndValue[1];
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },

            updateFieldSelection: function(fieldsObjectIndex, previousField) {
                return function(event) {
                    var newFieldObject = Object.assign({}, this.state.localAudience[fieldsObjectIndex]);
                    delete newFieldObject[previousField];
                    newFieldObject[event.target.value] = this.getPossibleFields(this.state.componentLevel)[event.target.value].slice(0, 1);
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },

            removeFieldFromFieldsObject: function(fieldsObjectIndex, fieldToRemove) {
                return function() {
                    var newFieldObject = Object.assign({}, this.state.localAudience[fieldsObjectIndex]);
                    delete newFieldObject[fieldToRemove];
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },


            updateValueSelection: function(fieldsObjectIndex, field, previousValue) {
                return function(event) {
                    var newFieldObject = Object.assign({}, this.state.localAudience[fieldsObjectIndex]);
                    newFieldObject[field] = newFieldObject[field].filter(value => value !== previousValue).concat([event.target.value]);
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },

            addValueToFieldOnFieldsObject: function(fieldsObjectIndex, field) {
                return function() {
                    var fieldsObject = this.state.localAudience[fieldsObjectIndex];
                    var newValue = this.getRemainingValues(fieldsObject, field, fieldsObject[field])[0];
                    var newFieldObject = Object.assign({}, fieldsObject);
                    newFieldObject[field] = fieldsObject[field].concat([newValue]);
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },

            removeValueFromFieldObject: function(fieldsObjectIndex, field, valueToRemove) {
                return function() {
                    var newFieldObject = Object.assign({}, this.state.localAudience[fieldsObjectIndex]);
                    newFieldObject[field] = newFieldObject[field].filter(value => value !== valueToRemove);
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },


            saveChanges: function() {
                this.props.onAudienceChange(this.state.localAudience);
                this.setState({editing: false});
            },

            cancelChanges: function() {
                this.setState({editing: false, localAudience: this.props.audience || [this.getDefaultFieldsObject()]});
            },

            clearAudience: function() {
                this.props.onAudienceChange(null);
                this.setState({editing: false, localAudience: [this.getDefaultFieldsObject()]});
            },


            render: function() {
                var conciseRepresentation = this.state.localAudience && <span>
                    {this.state.localAudience.length > 1 && "("}
                    {this.state.localAudience.map(expressionToOr =>
                        Object.entries(expressionToOr).map(function([field, expressionToAnd]) {
                            if (field === "examBoard" && allExamBoardsForStagePresent(expressionToOr)) return "any exam board";
                            if (expressionToAnd.length === 1) return expressionToAnd[0];
                            else return "(" + expressionToAnd.join(" or ") + ")";
                        }).join(" and ")
                    ).join(") or (")}
                    {this.state.localAudience.length > 1 && ")"}
                </span>;

                return <div>
                    {/* Display mode (concise representation) */}
                    {!this.state.editing && <div>
                        {
                            this.props.audience ? conciseRepresentation :
                            this.props.accordion ? "All" :
                            /* document level ? */ "None Specified"
                        } &nbsp;&nbsp;
                        <button className={actionBtnCls} onClick={() => this.setState({editing: !this.state.editing})}>Edit</button>
                    </div>}

                    {/* Edit mode */}
                    {this.state.editing && <div>
                        <div>
                            {this.state.localAudience.map((fieldsObject, fieldObjectIndex, fieldsObjects) =>
                                <span>
                                    {"("}
                                    {Object.entries(fieldsObject).map(([field, values], fieldIndex, fieldEntries) => <span>
                                        <select value={field} style={selectCSS} onChange={this.updateFieldSelection(fieldObjectIndex, field)}>
                                            <option value={field}>{field}</option>
                                            {this.getRemainingFieldsAndValue(fieldsObject).map(fieldEntry => <option value={fieldEntry[0]}>{fieldEntry[0]}</option>)}
                                        </select>
                                        {values.length === 1 ? " = " : " IN ["}
                                        {values.map((value, valueIndex, values) => <span>
                                            <select value={value} style={selectCSS} onChange={this.updateValueSelection(fieldObjectIndex, field, value)}>
                                                <option value={value}>{value}</option>
                                                {this.getRemainingValues(fieldsObject, field, values)
                                                    .map(value => <option value={value}>{value}</option>)}
                                            </select>
                                            {values.length > 1 && <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.removeValueFromFieldObject(fieldObjectIndex, field, value)}>🗙</button>}
                                            {valueIndex !== values.length - 1 && ", "}
                                            {this.getRemainingValues(fieldsObject, field, values).length !== 0 && valueIndex === values.length - 1 && <span>
                                                {values.length !== 1 && ", "}
                                                <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.addValueToFieldOnFieldsObject(fieldObjectIndex, field)}>➕</button>
                                            </span>}
                                        </span>)}
                                        {values.length !== 1 && "] "}
                                        {fieldEntries.length > 1 && <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.removeFieldFromFieldsObject(fieldObjectIndex, field)}>🗙</button>}
                                        {fieldIndex !== fieldEntries.length - 1 ? " AND " : " "}
                                        {this.getRemainingFieldsAndValue(fieldsObject).length !== 0 && fieldIndex === fieldEntries.length - 1 && <span>
                                            <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.addFieldToFieldsObject(fieldObjectIndex)}>AND ➕</button>
                                        </span>}
                                    </span>)}
                                    {")"}
                                    {fieldsObjects.length !== 1 && <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.removeFieldsObject(fieldObjectIndex)}>🗙</button>}
                                    {fieldObjectIndex !== fieldsObjects.length - 1 && <span> OR <br /></span>}
                                </span>
                            )}
                            {" "}
                            <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.addNewFieldsObject}>
                                OR ➕
                            </button>
                        </div>
                        <div>
                            Concise: {conciseRepresentation} &nbsp;&nbsp;
                            <button className={actionBtnCls} onClick={this.saveChanges}>
                                Set
                            </button> &nbsp;
                            <button className={actionBtnCls + " secondary"} onClick={this.cancelChanges}>
                                Cancel
                            </button> &nbsp;
                            <button className={actionBtnCls + " alert"} onClick={this.clearAudience}>
                                Clear
                            </button>
                        </div>
                    </div>}
                </div>
            }
        });
    }
});
