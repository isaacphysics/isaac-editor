define(["react"], function(React) {
    var possibleFields = {
        stage: ["A Level", "GCSE", "9", "8", "7"],
        difficulty: ["P1", "P2", "P3", "C1", "C2", "C3"],
        examBoard: ["AQA", "OCR", "WJEC"],
    };

    var tinyBtnCls = "button tiny secondary radius";
    var tinyBtnCSS = {padding: "0.5rem", background: "none", border: "solid 1px lightgrey"};
    var actionBtnCls = "button tiny radius";
    var selectCSS = {"width": "auto", "padding-right": "1rem"};

    return function(ContentEditor) {
        return React.createClass({
            getDefaultFieldsObject: function() {
                return {"stage": ["A Level"]};
            },

            getRemainingFieldsAndValue: function(existingFieldsObject) {
                return Object.entries(possibleFields)
                    .filter(fieldsEntry => Object.keys(existingFieldsObject).indexOf(fieldsEntry[0]) === -1)
                    .map(fieldsEntry => [fieldsEntry[0], fieldsEntry[1].slice(0, 1)]);
            },

            getRemainingValues: function(fieldName, existingValues) {
                return possibleFields[fieldName].filter(possibleValue => existingValues.indexOf(possibleValue) === -1);
            },

            getInitialState: function() {
                return {
                    localAudience: this.props.audience || [this.getDefaultFieldsObject()],
                    editing: false,
                };
            },


            addNewFieldsObject: function() {
                this.setState({localAudience: this.state.localAudience.concat([this.getDefaultFieldsObject()])})
            },

            removeFieldsObject: function(fieldsObjectIndex) {
                return function() {
                    this.setState({localAudience: this.state.local.filter((fieldsObject, index) => index !== fieldsObjectIndex)});
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
                    newFieldObject[event.target.value] = possibleFields[event.target.value].slice(0, 1);
                    this.setState({
                        localAudience: this.state.localAudience.map((existingFieldObject, index) => index === fieldsObjectIndex ? newFieldObject : existingFieldObject)
                    });
                }.bind(this);
            },

            removeFieldFromFieldsObject: function(fieldsObjectIndex, field) {
                return function() {
                    var newFieldObject = Object.assign({}, this.state.localAudience[fieldsObjectIndex]);
                    delete newFieldObject[previousField];
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
                    var fieldObject = this.state.localAudience[fieldsObjectIndex];
                    var newValue = this.getRemainingValues(field, fieldObject[field])[0];
                    var newFieldObject = Object.assign({}, fieldObject);
                    newFieldObject[field] = fieldObject[field].concat([newValue]);
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
                this.setState({editing: false, localAudience: this.props.audience});
            },

            clearAudience: function() {
                this.props.onAudienceChange(null);
                this.setState({editing: false});
            },


            render: function() {
                var conciseRepresentation = <span>
                    {this.state.localAudience.map(expressionToOr =>
                        Object.values(expressionToOr).map(expressionToAnd =>
                            expressionToAnd.length === 1 ? expressionToAnd[0] : "(" + expressionToAnd.join(", ") + ")"
                        ).join(" and ")
                    ).join(" or ")}
                </span>;

                return <div>
                    {/* Display mode (concise representation) */}
                    {!this.state.editing && <div>
                        {this.props.audience ? conciseRepresentation : "All"} &nbsp;&nbsp;
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
                                                {this.getRemainingValues(field, values).map(value => <option values={value}>{value}</option>)}
                                            </select>
                                            {values.length > 1 && <button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.removeValueFromFieldObject(fieldObjectIndex, field, value)}>🗙</button>}
                                            {valueIndex !== values.length - 1 && ", "}
                                            {this.getRemainingValues(field, values).length !== 0 && valueIndex === values.length - 1 && <span>
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
                            {" "}<button className={tinyBtnCls} style={tinyBtnCSS} onClick={this.addNewFieldsObject}>
                                OR ➕
                            </button>
                        </div>
                        <div>
                            Concise Representation: {conciseRepresentation} &nbsp;&nbsp;
                            <button className={actionBtnCls} onClick={this.saveChanges}>
                                Save
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
