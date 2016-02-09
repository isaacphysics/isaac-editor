/** @jsx React.DOM */
define(["react", "jquery", "codemirrorJS", "showdown/showdown", "showdown/extensions/table", "app/MathJaxConfig"], function(React, $) {

	var ReactTransitionGroup = React.addons.TransitionGroup;

	var enableMathJax = true;

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

	var nextTagListId = 0;
	var Tags = React.createClass({

		getDefaultProps: function() {
			return {
				dropdownId: nextTagListId++
			};
		},

		getInitialState: function() {
			return {
				allTags: []
			};
		},

		componentDidMount: function() {
			$(document).foundation();
			var self = this;
			ContentEditor.getTagList().then(function(tags) {
				self.setState({allTags: tags.sort()});
			})
		},

		componentDidUpdate: function(nextProps, nextState) {
			$(document).foundation();
		},

		addNewTag: function() {
			var newTag = window.prompt("Enter tag:");
			if (newTag) {
				this.props.onChange(this, this.props.tags, this.props.tags.concat(newTag.toLowerCase()));
			}
		},

		render: function() {

			var ts = [];

			for(var t in this.props.tags.sort()) {
				t = this.props.tags[t];

				var removeTag = function(t) {
					var newTags = JSON.parse(JSON.stringify(this.props.tags));
					newTags.splice(newTags.indexOf(t),1);
					this.props.onChange(this, this.props.tags, newTags);
				};

				ts.push(<span className="tag">{t} <i className="general foundicon-remove" onClick={removeTag.bind(this, t)}/></span>);
			}

			var allTagComponents = [];

			for(var t in this.state.allTags) {
				t = this.state.allTags[t];

				if (this.props.tags.indexOf(t) > -1)
					continue;

				var tag_choose = function(t) {
					this.props.onChange(this, this.props.tags, this.props.tags.concat(t));
				}

				var newT = (
					<li key={t}>
						<a href="javascript:void(0)" onClick={tag_choose.bind(this, t)}>{t}</a>
					</li>
				);

				allTagComponents.push(newT);
			}

			return (<div className="tags-container" ref="container">
				{ts}
				<a ref="foo" href="javascript:void(0);" data-dropdown={"tag-dropdown-" + this.props.dropdownId} className="button dropdown tiny success radius">Add tag...</a><br/>
				<ul ref="bar" id={"tag-dropdown-" + this.props.dropdownId} data-dropdown-content className="f-dropdown">
					{allTagComponents}
					<li><a href="javascript:void(0)" onClick={this.addNewTag}>&lt;New tag...&gt;</a></li>
				</ul>
			</div>);
		}
	});

	var RelatedContent = React.createClass({

		getInitialState: function() {
			return {
				searchString: "",
				results: []
			}
		},

		onSearchStringChange: function(e) {
			this.setState({
				searchString: e.target.value
			});
			var self = this;
			ContentEditor.getIdList(e.target.value).then(function(ids) {
				self.setState({
					results: ids
				});
			});
		},

		render: function() {

			var ids = [];

			for (var id in this.props.ids) {
				id = this.props.ids[id];

				var removeId = function(id) {
					var newIds = JSON.parse(JSON.stringify(this.props.ids));
					newIds.splice(newIds.indexOf(id), 1);
					this.props.onChange(this, this.props.ids, newIds);
				};

				ids.push(<span className="tag">{id} <i className="general foundicon-remove" onClick={removeId.bind(this, id)} /></span>);
			}

			var results = [];
			for (var result in this.state.results) {
				result = this.state.results[result];

				if (this.props.ids.indexOf(result.id) > -1)
					continue;

				var addId = function(id) {
					var newIds = JSON.parse(JSON.stringify(this.props.ids));
					newIds.push(id);
					this.props.onChange(this, this.props.ids, newIds);
				}

				var type = result.type;

				if (type == "isaacQuestionPage")
					type = "Question";

				if (type == "isaacConceptPage")
					type = "Concept";

				results.push(<button className={"button tiny " + (type == 'Question' ? 'success' : '') + " radius id-result"} onClick={addId.bind(this,result.id)}>{result.title} ({type})<br/>{result.id} <i className="general foundicon-plus"/></button>)
			}

			return <div className="tags-container" ref="container">
				{ids}
				<input type="text" placeholder="Type to add related content..." value={this.state.searchString} onChange={this.onSearchStringChange} />
				{results}
			</div>;
		}
	});

	var MetaData = React.createClass({

		getInitialState: function() {

			var dip = this.props.doc.date ? ContentEditor.dateFilter(new Date(this.props.doc.date), "yyyy-MM-dd HH:mm", "UTC") : "";
			var dop = this.props.doc.date ? ContentEditor.dateFilter(new Date(this.props.doc.date), "yyyy-MM-dd HH:mm", "UTC") : "";

			return {
				id: this.props.doc.id,
				title: this.props.doc.title,
				subtitle: this.props.doc.subtitle,
				author: this.props.doc.author,
				summary: this.props.doc.summary,
				altText: this.props.doc.altText,
				attribution: this.props.doc.attribution,
				level: this.props.doc.level,
				published: this.props.doc.published,
				url: this.props.doc.url,
				description: this.props.doc.description,
				dateInput: dip,
				dateOutput: dop,
				dateInt: this.props.doc.date,
				appId: this.props.doc.appId,
				appAccessKey: this.props.doc.appAccessKey,
				location: this.props.doc.location || {},
			};

		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onTagsChange: function(c, oldTags, newTags) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.tags = newTags;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onRelatedContentChange: function(c, oldRelatedContent, newRelatedContent) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.relatedContent = newRelatedContent;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onTextboxChange: function(key, e) {
			var newState = {};
			newState[key] = e.target.value;
			this.setState(newState);

			clearTimeout(this.metadataChangeTimeout);
			this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
		},

		onCheckboxChange: function(key, e) {
			var newState = {};
			newState[key] = e.target.checked;
			this.setState(newState);

			console.log("New checkbox state:", newState);

			clearTimeout(this.metadataChangeTimeout);
			this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
		},

		onDateChange: function(e) {
			var newVal = e.target.value;
			this.setState({
				dateInput: newVal,
			});

			var d = Date.parse(newVal.replace(/\-/g, "/"));
			if (d) {
				dt = new Date(d);
				this.setState({
					dateOutput: ContentEditor.dateFilter(dt, "yyyy-MM-dd HH:mm", "UTC"),
					dateInt: d,
				});

				clearTimeout(this.metadataChangeTimeout);
				this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);

			}
		},

		onMetadataChangeTimeout: function() {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);

			if (this.state.id || this.props.doc.id) {
				newDoc.id = this.state.id;
			}

			if (this.state.title || this.props.doc.title) {
				newDoc.title = this.state.title;
			}

			if (this.state.subtitle || this.props.doc.subtitle) {
				newDoc.subtitle = this.state.subtitle;
			}

			if (this.state.author || this.props.doc.author) {
				newDoc.author = this.state.author
			}

			if (this.state.summary || this.props.doc.summary) {
				newDoc.summary = this.state.summary;
			}

			if (this.state.altText || this.props.doc.altText) {
				newDoc.altText = this.state.altText;
			}

			if (this.state.published === true || this.state.published === false) {
				newDoc.published = this.state.published;
			}

			if (this.state.attribution || this.props.doc.attribution) {
				newDoc.attribution = this.state.attribution;
			}

			if (this.state.level || this.props.doc.level) {
				newDoc.level = parseInt(this.state.level);
			}

			if (this.state.description || this.props.doc.description) {
				newDoc.description = this.state.description;
			}

			if (this.state.url || this.props.doc.url) {
				newDoc.url = this.state.url;
			}

			if (this.state.dateInt || this.props.doc.dateInt) {
				newDoc.date = this.state.dateInt;
			}

			if (this.state.appId != null || this.props.doc.appId) {
				newDoc.appId = this.state.appId;
			}

			if (this.state.appAccessKey != null || this.props.doc.appAccessKey) {
				newDoc.appAccessKey = this.state.appAccessKey;
			}

			if (!$.isEmptyObject(this.state.location) || this.props.doc.location) {
				newDoc.location = this.state.location;
			}

			this.onDocChange(this, oldDoc, newDoc);
		},

		onLocationChange: function(field, e) {
			var newLoc = {};
			newState = $.extend({}, this.state);
			newState.location[field] = e.target.value;

			this.setState(newState);
			clearTimeout(this.metadataChangeTimeout);
			this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
		},

		toggleMetaData_click: function(e) {
			var n = $(this.refs.metadata.getDOMNode())
			if (n.is(":visible")) {
				n.hide();
				$(this.refs.toggleButton.getDOMNode()).html("Show Metadata");
			} else {
				n.show();
				$(this.refs.toggleButton.getDOMNode()).html("Hide Metadata");
			}
		},

		render: function() {

			var tagsComponent = <Tags tags={this.props.doc.tags || []} onChange={this.onTagsChange}/>;

			if (this.props.doc.type == "figure" || this.props.doc.type == "video") {
				var figureMeta = <div className="row">
					<div className="small-2 columns text-right"><span className="metadataLabel">Alt text: </span></div>
					<div className="small-10 columns"><input type="text" value={this.state.altText} onChange={this.onTextboxChange.bind(this, "altText")} /></div>
				</div>;
			}

			if (this.props.doc.type == "emailTemplate") {

			}

			if (this.props.doc.type == "isaacQuestionPage" || this.props.doc.type == "isaacFastTrackQuestionPage" || this.props.doc.type == "isaacConceptPage" || this.props.doc.type == "page" || this.props.doc.type == "isaacPageFragment" || this.props.doc.type == "isaacEventPage") {
				var pageMeta = [
					<div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Published?</span></div>
						<div className="small-10 columns"><input type="checkbox" checked={!!this.state.published} onChange={this.onCheckboxChange.bind(this, "published")} /> </div>
					</div>,
					<div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Summary</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.summary} onChange={this.onTextboxChange.bind(this, "summary")} /> </div>
					</div>
				];


				var relatedContent = <div className="row">
					<div className="small-2 columns text-right"><span className="metadataLabel">Related Content:</span></div>
					<div className="small-10 columns"><RelatedContent ids={this.props.doc.relatedContent || []} onChange={this.onRelatedContentChange} /> </div>
				</div>;
			}

			if (this.props.doc.type == "isaacWildcard") {
				var wildcardMetadata = [
					<div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Description</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.description} onChange={this.onTextboxChange.bind(this, "description")} /></div>
					</div>,
					<div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">URL</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.url} onChange={this.onTextboxChange.bind(this, "url")} /></div>
					</div>
				];
			}

			if (this.props.doc.type == "isaacEventPage") {
				var eventMetadata = [
					<div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Date<br/><small><code>YYYY-MM-DD HH:mm</code></small></span></div>
						<div className="small-5 columns"><input type="text" value={this.state.dateInput} onChange={this.onDateChange} /></div>
						<div className="small-5 columns">{this.state.dateOutput}</div>
					</div>,
					<div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Location</span></div>
						<div className="small-5 columns end">
							<input type="text" placeholder="Address Line 1" value={this.state.location.addressLine1} onChange={this.onLocationChange.bind(this, "addressLine1")} />
							<input type="text" placeholder="Address Line 2" value={this.state.location.addressLine2} onChange={this.onLocationChange.bind(this, "addressLine2")} />
							<input type="text" placeholder="Town" value={this.state.location.town} onChange={this.onLocationChange.bind(this, "town")} />
							<input type="text" placeholder="County" value={this.state.location.county} onChange={this.onLocationChange.bind(this, "county")} />
							<input type="text" placeholder="Postal Code" value={this.state.location.postalCode} onChange={this.onLocationChange.bind(this, "postalCode")} />
						</div>
					</div>,
				];
			}

			if (this.props.doc.type == "isaacQuestionPage" || this.props.doc.type == "isaacFastTrackQuestionPage") {
				var questionPageMeta = <div className="row">
					<div className="small-2 columns text-right"><span className="metadataLabel">Attribution</span></div>
					<div className="small-10 columns"><input type="text" value={this.state.attribution} onChange={this.onTextboxChange.bind(this, "attribution")} /></div>
				</div>;

				var levelMeta = <div className="row">
					<div className="small-2 columns text-right"><span className="metadataLabel">Level</span></div>
					<div className="small-10 columns"><input type="text" value={this.state.level} onChange={this.onTextboxChange.bind(this, "level")} /></div>
				</div>;
			}

			if (this.props.doc.type == "anvilApp") {
				var anvilAppMeta = [<div className="row">
					<div className="small-2 columns text-right">
						App ID:
					</div>
					<div className="small-4 columns end">
						<input type="text" placeholder="App ID" onChange={this.onTextboxChange.bind(this,"appId")} value={this.state.appId} />,
					</div>
				</div>,
				<div className="row">
					<div className="small-2 columns text-right">
						Access Key:
					</div>
					<div className="small-4 columns end">
						<input type="text" placeholder="Access Key" onChange={this.onTextboxChange.bind(this,"appAccessKey")} value={this.state.appAccessKey} />,
					</div>
				</div>];
			}

			return (
				<div className="metadata-container">
					<button onClick={this.toggleMetaData_click} className="button tiny round" ref="toggleButton">Show MetaData</button>
					<div className="metadata" ref="metadata">
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Tags: </span></div>
							<div className="small-10 columns">{tagsComponent}</div>
						</div>
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">ID: </span></div>
							<div className="small-10 columns"><input type="text" value={this.state.id} onChange={this.onTextboxChange.bind(this, "id")} /></div>
						</div>
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Title: </span></div>
							<div className="small-10 columns"><input type="text" value={this.state.title} onChange={this.onTextboxChange.bind(this, "title")} /></div>
						</div>
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Subtitle: </span></div>
							<div className="small-10 columns"><input type="text" value={this.state.subtitle} onChange={this.onTextboxChange.bind(this, "subtitle")} /></div>
						</div>
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Author: </span></div>
							<div className="small-10 columns"><input type="text" value={this.state.author} onChange={this.onTextboxChange.bind(this, "author")} /></div>
						</div>

						{wildcardMetadata}
						{relatedContent}
						{figureMeta}
						{questionPageMeta}
						{levelMeta}
						{pageMeta}
						{eventMetadata}
						{anvilAppMeta}
					</div>
				</div>
			);
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
					 lineWrapping: true,
					 autofocus: true});

				cm.setCursor(9999,9999);

				$("body").scrollTop($(this.refs.placeholder.getDOMNode()).offset().top + $(this.refs.placeholder.getDOMNode()).height() - $(window).height() / 2);

				cm.on("change", (function(inst, changeObj) {
					this.setState({editedValue: inst.getValue()});
				}).bind(this));
			}
			MathJax.resetLabels();

			if (enableMathJax && this.refs.contentRow)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.contentRow.getDOMNode()]);

		},

		componentDidMount: function() {
			if (enableMathJax && this.refs.contentRow)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.contentRow.getDOMNode()]);
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
						var converter = new Showdown.converter({
							extensions: ["table"]
						});
						var html = converter.makeHtml(this.props.value);
						renderer.props.dangerouslySetInnerHTML = {__html: html};
						break;
					case "plain":
						renderer.props.children = this.props.value;
						break;
					default:
						renderer.props.children = "<" + this.props.encoding + "> " + this.props.value;
						break;
				}

				return (
					<div className="row" ref="contentRow">
						<div className="large-12 columns">
							{renderer}
						</div>
					</div>
				);
			case "edit":
				return (
					<div>
						<div className="row">
							<div className="small-1 small-offset-6 columns text-right">
								ID:
							</div>
							<div className="small-5 columns">
								<input type="text" value={this.props.id} />
							</div>
						</div>
						<button type="button" onClick={this.onDone}>Done</button>
						<div ref="placeholder" />
						<button type="button" onClick={this.onDone}>Done</button>
					</div>
				);
			}
		}
	});

	var ContentChildren = React.createClass({

		getInitialState: function() {
			return {
				keys: this.props.items.map(function(e,i) {
					return Math.random();
				}),

				itemIds: this.props.items.map(function(e,i) {
					return e.id;
				}),
			};
		},

		onItemChange: function(index, c, oldDoc, newDoc) {
			var oldItems = this.props.items;
			var newItems = this.props.items.slice(0);
			newItems[index] = newDoc;

			this.props.onChange(this, oldItems, newItems);
		},

		onItemInsert: function(insertBeforeIndex) {
			ContentEditor.snippetLoader.loadContentTemplate(this.props.requiredChildType).then(function(t) {
				var oldItems = this.props.items;
				var newItems = oldItems.slice(0);
				newItems.splice(insertBeforeIndex,0,t);

				newKeys = this.state.keys.slice(0);
				newKeys.splice(insertBeforeIndex,0,Math.random());
				this.setState({keys: newKeys});

				this.props.onChange(this, oldItems, newItems);
			}.bind(this)).catch(function(e) {
				console.error("Could not load content template.", e);
			})
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

		onItemIdChange: function(index, e) {
			var newId = e.target.value;
			var oldDoc = this.props.items[index];
			var newDoc = JSON.parse(JSON.stringify(oldDoc));
			newDoc.id = newId;

			this.onItemChange(index, this, oldDoc, newDoc);
		},

		getItemComponent: function(item,index) {

			return (<div key={this.state.keys[index]} className="ops-wrapper children" onMouseEnter={this.opsMouseEnter.bind(this, index)} onMouseLeave={this.opsMouseLeave.bind(this, index)}>
						<InsertOp className="above"
						          onClick={this.onItemInsert.bind(this, index)}
						          onMouseEnter={this.insertMouseEnter.bind(this, index)}
						          onMouseLeave={this.insertMouseLeave.bind(this, index)}
						          ref={"insertBefore" + index}/>

						<div className="op-id text-right" ref={"id" + index}>ID: <input className="inline" value={this.state.itemIds[index]} onChange={this.onItemIdChange.bind(this, index)} /></div>
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
			$(this.refs["id" + index].getDOMNode()).addClass("highlight-delete")
		},

		deleteMouseLeave: function(index) {
			$(this.refs["item" + index].getDOMNode()).removeClass("highlight-delete")
			$(this.refs["id" + index].getDOMNode()).removeClass("highlight-delete")
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
				editedDoc: this.props.doc
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
					<button type="button" onClick={this.onDone}>Done</button>
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

					ContentEditor.snippetLoader.loadContentTemplate().then(function(t) {
						var newChildren = [
							t,
							{
								type: "content",
								encoding: this.props.encoding,
								value: this.props.value
							}
						];

						this.props.onChange(this, this.props.value, undefined, this.props.children, newChildren);
					}.bind(this)).catch(function(e) {
						console.error("Unable to load content template", e);
					});
				}

				function insertAfterValue() {
					// Transform to list, add new content object after this one.

					ContentEditor.snippetLoader.loadContentTemplate().then(function(t) {
						var newChildren = [
							{
								type: "content",
								encoding: this.props.encoding,
								value: this.props.value
							},
							t
						];

						this.props.onChange(this, this.props.value, undefined, this.props.children, newChildren);
					}.bind(this)).catch(function(e) {
						console.error("Unable to load content template", e);
					});
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
		}
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
		}
	});

	var EmailTemplateBlock = React.createClass({

		getInitialState: function() {
			return {
				subject: this.props.doc.subject,
			}
		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onSubjectChange: function(e) {
			this.setState({
				subject: e.target.value,
				title: ""
			});

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.subject = e.target.value;
			newDoc.title = "";

			this.onDocChange(this, oldDoc, newDoc);
		},

		onPlainTextContentChange: function(c, oldVal, newVal) {

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.plainTextContent = newVal;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onHtmlContentChange: function(c, oldVal, newVal) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.htmlContent = newVal;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {
			return (
				<Block type="emailTemplate" blockTypeTitle="E-mail template" doc={this.props.doc} onChange={this.onDocChange}>
					<form>
						<div className="row">
							<div className="small-12 columns">
								<label for="subjectTextBox">Subject: </label><input id="subjectTextBox" type="text" value={this.props.doc.subject} onChange={this.onSubjectChange} placeholder="E-mail subject"/>
							</div>
						</div>
						<div className="row">

							<div className="small-12 columns plain-text-content">
								<div className="separator-title">Plain text</div>
								<ContentValueOrChildren value={this.props.doc.plainTextContent} disableListOps="disabled" encoding="plain" onChange={this.onPlainTextContentChange} />
							</div>

							<div className="small-12 columns">
								<div className="separator-title">HTML</div>
								<ContentValueOrChildren value={this.props.doc.htmlContent} disableListOps="disabled" encoding="html" onChange={this.onHtmlContentChange} />
							</div>
						</div>
					</form>
				</Block>
			);
		}
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
			}).bind(this)).catch((function(e) {
				console.error("Failed to load image", this.props.doc.src, e);
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

			var optionalCaption = !this.props.doc || this.props.doc.type == "image" ? null : <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onCaptionChange}/>;

			return (
				<Block type="figure" blockTypeTitle="Figure" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-6 columns text-center">
							<img width="250px" height="250px" src="img/not-found.png" ref="img" onClick={this.img_Click} accept="image/svg+xml,image/png" onDragOver={this.img_DragOver} onDrop={this.img_Drop} />
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
							Video src: {this.props.doc.src}
						</div>
						<div className="small-6 columns">
							{optionalCaption}
						</div>
					</div>
				</Block>
			);
		}
	});

	var AnvilAppBlock = React.createClass({

		getInitialState: function() {
			return {
				editedAppId: this.props.doc.appId,
				editedAccessKey: this.props.doc.appAccessKey
			};
		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},


		render: function() {

			return (
				<Block type="anvilApp" blockTypeTitle="Anvil App" doc={this.props.doc} onChange={this.onDocChange}>
					<div style={{color: "#bbb"}} className="text-center"><i>App height will be correct on live pages.</i></div><br/><br/>
					<iframe style={{width: "100%", height: "300px"}} src={"https://anvil.works/apps/" + this.props.doc.appId + "/" + this.props.doc.appAccessKey + "/app"}/>
				</Block>
			);
		}
	});

	var QuestionBlock = React.createClass({

		getInitialState: function() {
			return {
				significantFigures: this.props.doc.significantFigures,
				title: this.props.doc.title,
				suggestedDuration: this.props.doc.suggestedDuration,
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

		onSignificantFiguresChange: function(e) {

			this.setState({
				significantFigures: e.target.value
			});

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.significantFigures = parseInt(e.target.value);

			this.onDocChange(this, oldDoc, newDoc);
		},

		onTitleChange: function(e) {

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.title = e.target.value;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onsuggestedDurationChange: function(e) {

			this.setState({
				suggestedDuration: e.target.value,
			});

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.suggestedDuration = parseInt(e.target.value);

			this.onDocChange(this, oldDoc, newDoc);
		},

		type_Change: function() {
			var newType = $(this.refs.questionTypeRadios.getDOMNode()).find('input[name=question-type]:checked').val();

			// newVal must be a doc
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.type = newType;
			if (newType == "isaacNumericQuestion") {
				if (!newDoc.hasOwnProperty("requireUnits")) {
					// Add the default value if it is missing
					newDoc.requireUnits = true;
				}
			} else {
				// Remove the requireUnits property as it is no longer applicable to this type of question
				delete newDoc.requireUnits;
			}

			this.onDocChange(this, oldDoc, newDoc);
		},

		onCheckboxChange: function(key, e) {
			if (key != "requireUnits") return;

			console.log("New checkbox state:", e.target.checked);

			// newVal must be a doc
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.requireUnits = e.target.checked;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {
			if (this.props.doc.type == "isaacNumericQuestion" && !this.props.doc.hasOwnProperty("requireUnits")) {
				this.props.doc.requireUnits = true;
			}

			var hints = {
				"type": "content",
				"layout": "tabs",
				"children": this.props.doc.hints || []
			};

			var exposition = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} encoding={this.props.doc.encoding} onChange={this.onExpositionChange}/>;
			var optionalHints = <Block type="hints" blockTypeTitle="Hints">
				<TabsBlock doc={hints} onChange={this.onHintsChange} allowTabTitles="false"/>
			</Block>

			if (this.props.doc.type == "isaacNumericQuestion") {
				var requiredChildType = "quantity";
			} else if (this.props.doc.type == "isaacSymbolicQuestion") {
				var requiredChildType = "formula";
			} else {
				var requiredChildType = "choice";
			}

			if (this.props.doc.type == "isaacQuestion" || this.props.doc.type == "isaacMultiChoiceQuestion" || this.props.doc.type == "isaacNumericQuestion" || this.props.doc.type == "isaacSymbolicQuestion")
				var choices = <Block type="choices" blockTypeTitle="Choices">
					<ContentChildren items={this.props.doc.choices || []} encoding={this.encoding} onChange={this.onChoicesChange} requiredChildType={requiredChildType}/>
				</Block>

			if (!this.props.doc.answer) {
				console.error("Attempting to render question with no answer. This will fail. Content:", this.props.doc);
			}

			return (
				<Block type="question" blockTypeTitle="Question" doc={this.props.doc} onChange={this.onDocChange}>
					<form>
						<div className="row">
							<div className="small-6 small-offset-3 columns text-center end">
								<input type="text" value={this.state.title} onChange={this.onTitleChange} placeholder="Question title"/>
							</div>
						</div>
						<div ref="questionTypeRadios" style={{textAlign: "center"}}>
							<input type="radio" name="question-type" value="isaacQuestion" checked={this.props.doc.type == "isaacQuestion"} onChange={this.type_Change} /> Quick Question
							<input type="radio" name="question-type" value="isaacMultiChoiceQuestion" checked={this.props.doc.type == "isaacMultiChoiceQuestion"} onChange={this.type_Change} /> Multiple Choice Question
							<input type="radio" name="question-type" value="isaacNumericQuestion" checked={this.props.doc.type == "isaacNumericQuestion"} onChange={this.type_Change} /> Numeric Question
							<input type="radio" name="question-type" value="isaacSymbolicQuestion" checked={this.props.doc.type == "isaacSymbolicQuestion"} onChange={this.type_Change} /> Symbolic Question
						</div>
						<div className="row">
							<div className="small-3 small-offset-3 columns text-right">
								Suggested time (mins):
							</div>
							<div className="small-3 columns end">
								<input type="text" value={this.state.suggestedDuration} onChange={this.onsuggestedDurationChange}/>
							</div>
						</div>
						<div ref="requireUnitsCheckbox" style={{textAlign: "center", display: this.props.doc.type == "isaacNumericQuestion" ? "block" : "none"}}>
							<label><input type="checkbox" checked={this.props.doc.requireUnits} onChange={this.onCheckboxChange.bind(this, "requireUnits")} />Require Units</label>
							<label>Significant Figures: <input type="text" value={this.state.significantFigures} onChange={this.onSignificantFiguresChange} style={{display:"inline", width: "initial"}}/></label>
						</div>
					</form>
					{exposition}
					{choices}
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

	var EventPageBlock = React.createClass({

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

		onThumbnailChange: function(c, oldVal, newVal) {
			//console.log("onThumbnailChange", newVal);
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.eventThumbnail = newVal;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onLocationClick: function() {
			this.refs.blk.onMdClick();
		},

		render: function() {

			if (this.props.doc.location) {
				var loc = [<div style={{color: "#aaa"}} onClick={this.onLocationClick}><br/>
					{this.props.doc.location.addressLine1}, {this.props.doc.location.county}
				</div>,<br/>];
			}
			return (
				<Block ref="blk" type="eventPage" blockTypeTitle="Event Page" doc={this.props.doc} onChange={this.onDocChange}>
					{loc}
					<FigureBlock doc={this.props.doc.eventThumbnail} onChange={this.onThumbnailChange} />
					<ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
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
				// debugger;
				return <div className="block type-unknown">[Block of unknown content type: '{this.props.doc.type}']</div>;
			}

			if (this.props.doc.layout == "tabs") {
				return (
					<TabsBlock doc={this.props.doc} onChange={this.onDocChange}/>
				);
			}

			if (this.props.doc.layout == "accordion") {
				return (
					<AccordionBlock doc={this.props.doc} onChange={this.onDocChange}/>
				);
			}

			if (this.props.doc.type !== "isaacWildcard") {
				var children = <ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>;
			}

			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
					{children}
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

		onExplanationChange: function(c, oldVal, newVal) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.explanation = newVal;

			this.onDocChange(this, oldDoc, newDoc);
		},

		correct_toggle: function(e) {

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);

			newDoc.correct = !oldDoc.correct;

			this.onDocChange(this, oldDoc, newDoc);
		},

		render: function() {

			var emptyExplanation = {
				type: "content",
				children: [],
				encoding: "markdown"
			};

			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-1 column text-right">
							{this.props.doc.correct ?
								<i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
								<i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
						</div>
						<div className="small-6 columns" >
							<ContentValueOrChildren value={this.props.doc.value} children={this.props.doc.children} disableListOps={this.props.disableListOps} encoding={this.props.doc.encoding} onChange={this.onContentChange}/>
						</div>
						<div className="small-5 columns" >
							<ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
						</div>
					</div>
				</Block>
			);
		}
	});

	var QuantityChoiceBlock = React.createClass({

		getInitialState: function() {
			return {
				editing: false,
				editedValue: this.props.doc.value,
				editedUnits: this.props.doc.units
			};
		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onContentChange: function(c, oldVal, newVal, oldUnits, newUnits) {
			// newVal could be a string or a list.
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.units = newUnits;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onExplanationChange: function(c, oldVal, newVal) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.explanation = newVal;

			this.onDocChange(this, oldDoc, newDoc);
		},

		correct_toggle: function(e) {

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);

			newDoc.correct = !oldDoc.correct;

			this.onDocChange(this, oldDoc, newDoc);
		},

		componentDidMount: function() {
			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
		},

		componentDidUpdate: function() {
			MathJax.resetLabels();

			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);

		},

		edit: function() {
			this.setState({
				editing: true
			});

			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
		},

		done: function() {
			this.setState({
				editing: false
			});

			this.onContentChange(this, this.props.doc.value, this.state.editedValue, this.props.doc.units, this.state.editedUnits);

			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
		},

		setEditedValue: function(e) {
			this.setState({editedValue: e.target.value});
		},

		setEditedUnits: function(e) {
			this.setState({editedUnits: e.target.value});
		},

		render: function() {

			var emptyExplanation = {
				type: "content",
				children: [],
				encoding: "markdown"
			};

			if (this.state.editing) {
				var content = <div ref="content">
					{[
						"$\\\\quantity{",
						<input type="text" placeholder="Value" style={{width: "80px", display: "inline-block"}} onChange={this.setEditedValue} value={this.state.editedValue} />,
						"}{",
						<input type="text" placeholder="Units" style={{width: "80px", display: "inline-block"}} onChange={this.setEditedUnits} value={this.state.editedUnits} />,
						"}$"
					]}
					&nbsp;<button onClick={this.done} className="button tiny">Done</button>
				</div>;
			} else {
				var html = "$\\quantity{" + (this.props.doc.value || "") + "}{" + (this.props.doc.units || "") + "}$";

				if (this.props.doc.value) {
					var content = <span onClick={this.edit} ref="content" dangerouslySetInnerHTML={{__html: html}}></span>;
				} else {
					var content = <span onClick={this.edit} ref="content" > <i>Enter value and units here</i></span>;
				}
			}

			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-1 column text-right">
							{this.props.doc.correct ?
								<i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
								<i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
						</div>
						<div className="small-6 columns" >
							{content}
						</div>
						<div className="small-5 columns" >
							<ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
						</div>
					</div>
				</Block>
			);
		}
	});

	var FormulaChoiceBlock = React.createClass({

		getInitialState: function() {
			return {
				editing: false,
				editedValue: this.props.doc.value,
				editedPythonExpression: this.props.doc.pythonExpression
			};
		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onContentChange: function(c, oldVal, newVal, oldPythonExpression, newPythonExpression) {
			// newVal could be a string or a list.
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.value = newVal;
			newDoc.pythonExpression = newPythonExpression;

			this.onDocChange(this, oldDoc, newDoc);
		},

		onExplanationChange: function(c, oldVal, newVal) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);
			newDoc.explanation = newVal;

			this.onDocChange(this, oldDoc, newDoc);
		},

		correct_toggle: function(e) {

			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);

			newDoc.correct = !oldDoc.correct;

			this.onDocChange(this, oldDoc, newDoc);
		},

		requiresExact_toggle: function(e) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, oldDoc);

			newDoc.requiresExactMatch = !oldDoc.requiresExactMatch;

			this.onDocChange(this, oldDoc, newDoc);
		},

		componentDidMount: function() {
			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
		},

		componentDidUpdate: function() {
			MathJax.resetLabels();

			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);

		},

		edit: function() {
			this.setState({
				editing: true
			});

			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
		},

		done: function() {
			this.setState({
				editing: false
			});

			this.onContentChange(this, this.props.doc.value, this.state.editedValue, this.props.doc.pythonExpression, this.state.editedPythonExpression);

			if (enableMathJax && this.refs.content)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.refs.content.getDOMNode()]);
		},

		setEditedValue: function(e) {
			this.setState({editedValue: e.target.value});
		},

		setEditedPythonExpression: function(e) {
			this.setState({editedPythonExpression: e.target.value});
		},

		render: function() {

			var emptyExplanation = {
				type: "content",
				children: [],
				encoding: "markdown"
			};

			if (this.state.editing) {
				var content = <div ref="content">
					<table>
						<tr>
							<td className="text-right">LaTeX formula:</td>
							<td><input type="text" style={{display: "inline-block"}} onChange={this.setEditedValue} value={this.state.editedValue} /></td>
						</tr>
						<tr>
							<td className="text-right">Python expression:</td>
							<td><input type="text" style={{display: "inline-block", fontFamily: "monospace", fontSize: "1.5em"}} onChange={this.setEditedPythonExpression} value={this.state.editedPythonExpression} /></td>
						</tr>
					</table>
					<button onClick={this.done} className="button tiny">Done</button>
				</div>;
			} else {
				var html = (this.props.doc.value || "") + " <pre style=\"background:#fff;margin-top:0.5em;\">PYTHON: " + (this.props.doc.pythonExpression || "") + "</pre>";

				if (this.props.doc.value) {
					var content = <span onClick={this.edit} ref="content" dangerouslySetInnerHTML={{__html: html}}></span>;
				} else {
					var content = <span onClick={this.edit} ref="content" style={{display: "block"}}> <i>Enter value and python expression here</i></span>;
				}
			}

			return (
				<Block type="content" blockTypeTitle={this.props.blockTypeTitle} doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="small-1 column text-right">
							{this.props.doc.correct ?
								<i style={{color: "#0a0"}} className="correct-mark general foundicon-checkmark" onClick={this.correct_toggle}/> :
								<i style={{color: "#a00"}} className="correct-mark general foundicon-remove" onClick={this.correct_toggle} />}
						</div>
						<div className="small-6 columns" >
							{content}
							<input style={{marginTop: "1em"}} type="checkbox" checked={this.props.doc.requiresExactMatch} onChange={this.requiresExact_toggle}/> Require exact match
						</div>
						<div className="small-5 columns" >
							<ContentBlock type="content" blockTypeTitle="Explanation" doc={this.props.doc.explanation || emptyExplanation} onChange={this.onExplanationChange} />
						</div>
					</div>
				</Block>
			);
		}
	});


	var TabsBlock = React.createClass({

		getInitialState: function() {
			return {
				activeTab: this.props.doc.children.length > 0 ? 0 : null
			}
		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		activateTab: function(i) {
			this.setState({
				activeTab: null
			}, function() {
				this.setState({
					activeTab: i
				})
			});
		},

		setId: function() {
			var newId = window.prompt("Type a new ID for this tab:", this.props.doc.children[this.state.activeTab].id);
			if (newId != null)
			{
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[this.state.activeTab].id = newId;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			}
		},

		setTitle: function() {
			var newTitle = window.prompt("Type a new title for this tab:", this.props.doc.children[this.state.activeTab].title);
			if (newTitle != null)
			{
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[this.state.activeTab].title = newTitle;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			}
		},

		deleteTab: function() {
			var doIt = window.confirm("Are you sure you want to delete this tab?");

			if (doIt) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children.splice(this.state.activeTab,1);

				this.onDocChange(this, oldDoc, newDoc);
				this.setState({
					activeTab: newDoc.children.length > 0 ? 0 : null
				})
			}
		},

		addTab: function() {

			ContentEditor.snippetLoader.loadContentTemplate("tab").then(function(t) {

				var newDoc = $.extend({}, this.props.doc);
				newDoc.children.push(t);

				this.onDocChange(this, this.props.doc, newDoc);
				this.setState({
					activeTab: newDoc.children.length - 1
				})

			}.bind(this)).catch(function(e) {
				console.error("Unable to load tab template", e);
			});

		},

		onTabChange: function(c, oldVal, newVal) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, this.props.doc);
			newDoc.children[this.state.activeTab] = newVal;

			this.onDocChange(this, oldDoc, newDoc);
			this.forceUpdate();
		},

		render: function() {

			var tabButtons = [];

			for(var i in this.props.doc.children) {
				var t = this.props.doc.children[i];

				var button = <button key={"tabButton" + i} onClick={this.activateTab.bind(this, i)} className={"round " + (this.state.activeTab == i ? "active-tab" : "inactive-tab")}>{i}: {t.title}</button>;
				tabButtons.push(button);
			}

			var button = <button key="newTabButton" onClick={this.addTab} className={"round alert tiny"}><i className="foundicon-plus"></i></button>;
			tabButtons.push(button);

			if (this.state.activeTab != null) {
				var editTitle = null;
				if (!this.props.hasOwnProperty("allowTabTitles") || this.props.allowTabTitles !== "false") {
					editTitle = <span><button onClick={this.setTitle} className="tiny radius">Edit tab title...</button>&nbsp;</span>
				}
				var thisTab = <div className="active-tab">
					<div style={{textAlign: "right"}}>
						<span><small>ID: {this.props.doc.children[this.state.activeTab].id}&nbsp;</small></span>
						<button onClick={this.setId} className="tiny radius">Edit tab ID...</button>&nbsp;
						{editTitle}
						<button onClick={this.deleteTab} className="tiny radius alert">Delete tab</button>
					</div>
					<VariantBlock doc={this.props.doc.children[this.state.activeTab]} onChange={this.onTabChange} />
				</div>;
			}

			return 	(
				<Block type="tabs" blockTypeTitle="Tabs" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row tabs-content">
						<div className="small-12 columns">
							{tabButtons} <br/>
							{thisTab}
						</div>
					</div>
				</Block>
			);

		}
	})

	var AccordionBlock = React.createClass({

		getInitialState: function() {
			return {
				activeSection: this.props.doc.children.length > 0 ? 0 : null
			}
		},

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		activateSection: function(i) {
			this.setState({
				activeSection: null
			}, function() {
				this.setState({
					activeSection: i
				})
			});
		},

		setId: function() {
			var newId = window.prompt("Type a new ID for this accordion section:", this.props.doc.children[this.state.activeSection].id);
			if (newId != null)
			{
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[this.state.activeSection].id = newId;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			}
		},

		setTitle: function() {
			var newTitle = window.prompt("Type a new title for this accordion section:", this.props.doc.children[this.state.activeSection].title);
			if (newTitle != null)
			{
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[this.state.activeSection].title = newTitle;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			}
		},

		setLevel: function() {
			var newLevel = window.prompt("Type a new level for this accordion section. This should be an integer 1-6.", this.props.doc.children[this.state.activeSection].level);
			if (newLevel != null && ((parseInt(newLevel) > 0 && parseInt(newLevel) < 7) || newLevel === "")) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children[this.state.activeSection].level = newLevel;

				this.onDocChange(this, oldDoc, newDoc);
				this.forceUpdate();
			} else {
				window.alert("Invalid level entered: " + newLevel);
			}
		},

		deleteSection: function() {
			var doIt = window.confirm("Are you sure you want to delete this section?");

			if (doIt) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, this.props.doc);
				newDoc.children.splice(this.state.activeSection,1);

				this.onDocChange(this, oldDoc, newDoc);
				this.setState({
					activeSection: newDoc.children.length > 0 ? 0 : null
				})
			}
		},

		addSection: function() {

			ContentEditor.snippetLoader.loadContentTemplate("accordionSection").then(function(t) {

				var newDoc = $.extend({}, this.props.doc);
				newDoc.children.push(t);

				this.onDocChange(this, this.props.doc, newDoc);
				this.setState({
					activeSection: newDoc.children.length - 1
				})

			}.bind(this)).catch(function(e) {
				console.error("Unable to load accordion section template", e);
			});

		},

		onSectionChange: function(c, oldVal, newVal) {
			var oldDoc = this.props.doc;
			var newDoc = $.extend({}, this.props.doc);
			newDoc.children[this.state.activeSection] = newVal;

			this.onDocChange(this, oldDoc, newDoc);
			this.forceUpdate();
		},

		onScroll: function(e) {
			if (!this.refs.sectionButtons)
				return; // We are in edit mode, so no section buttons were rendered.

			var sectionButtons = $(this.refs.sectionButtons.getDOMNode());
			var sectionButtonsTop = sectionButtons.offset().top - $(document).scrollTop();

			var maxPadding = sectionButtons.parent().height() - sectionButtons.height();

			sectionButtons.css("padding-top", Math.max(0,Math.min(maxPadding, -sectionButtonsTop)));
		},

		componentDidMount: function() {
			$(document).on("scroll", this.onScroll);
		},

		componentWillUnmount: function() {
			$(document).off("scroll");
		},

		render: function() {

			var sectionButtons = [];

			for(var i in this.props.doc.children) {
				var t = this.props.doc.children[i];

				var button = <button key={"sectionButton"+i}  onClick={this.activateSection.bind(this, i)} className={"round " + (this.state.activeSection == i ? "active-section" : "inactive-section")}> {t.level ? "Level " + t.level : "Section " + i}</button>;
				sectionButtons.push(button);
				sectionButtons.push(<br key={Math.random()}/>);
			}

			var button = <button key="newSectionButton" onClick={this.addSection} className={"round alert tiny"}><i className="foundicon-plus"></i></button>;
			sectionButtons.push(button);

			if (this.state.activeSection != null) {
				var thisSection = <div className="active-accordion-section">
					<div style={{textAlign: "right"}}>
						<span><small>ID: {this.props.doc.children[this.state.activeSection].id}&nbsp;</small></span>
						<button onClick={this.setId} className="tiny radius">Edit section ID...</button>&nbsp;
						<button onClick={this.setTitle} className="tiny radius">Edit section title...</button>&nbsp;
						<button onClick={this.setLevel} className="tiny radius">Edit section level...</button>&nbsp;
						<button onClick={this.deleteSection} className="tiny radius alert">Delete section</button>
					</div>
					<VariantBlock doc={this.props.doc.children[this.state.activeSection]} onChange={this.onSectionChange} />
				</div>;
			}

			return 	(
				<Block type="accordion" blockTypeTitle="Accordion" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row accordion-content">
						<div className="small-2 columns section-buttons" ref="sectionButtons">
							{sectionButtons}
						</div>
						<div className="small-10 columns accordion-section">
							{thisSection}
						</div>
					</div>
				</Block>
			);

		}
	})

	var UnknownBlock = React.createClass({

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		chooseQuestion: function(e) {
			var type = $(e.target).data("chosenType");

			ContentEditor.snippetLoader.loadQuestionTemplate(type).then(function(t) {

				var newDoc = $.extend({}, this.props.doc, t);
				this.props.onChange(this, this.props.doc, newDoc);

			}.bind(this)).catch(function(e) {
				console.error("Unable to load question template of type", type, e);
			});
		},

		chooseType: function(e) {

			var type = $(e.target).data("chosenType");

			ContentEditor.snippetLoader.loadContentTemplate(type).then(function(t) {

				var newDoc = $.extend({}, t);
				this.props.onChange(this, this.props.doc, newDoc);

			}.bind(this)).catch(function(e) {
				console.error("Unable to load content template of type", type, e);
			});
		},

		render: function() {
			return (
				<Block type="unknown" blockTypeTitle="?" doc={this.props.doc} onChange={this.onDocChange}>
					<div className="row">
						<div className="large-8 large-offset-2 columns text-center">
							Please choose a block type: <br/>
							<a onClick={this.chooseType} data-chosen-type="content">content</a>&nbsp; | &nbsp;
							<a onClick={this.chooseQuestion} data-chosen-type="isaacQuestion">question</a>&nbsp; | &nbsp;
							<a onClick={this.chooseType} data-chosen-type="figure">figure</a>&nbsp; | &nbsp;
							<a onClick={this.chooseType} data-chosen-type="video">video</a>&nbsp; | &nbsp;
							<a onClick={this.chooseType} data-chosen-type="tabs">tabs</a>&nbsp; | &nbsp;
							<a onClick={this.chooseType} data-chosen-type="accordion">accordion</a>
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
				onChange: (function() { console.warn("Called undefined onChange function of block", this.props.doc); }).bind(this)
			};
		},

		getInitialState: function() {
			return {
				mode: "render"
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

		onDocChange: function(c, oldDoc, newDoc) {
			this.props.onChange(this, oldDoc, newDoc);
		},

		onMdClick: function() {
			this.refs.md.toggleMetaData_click();
		},

		render: function() {
			if (this.state.mode == "render") {

				if (this.props.doc && displayMetadataForTypes.indexOf(this.props.doc.type) > -1) {
					var metaDataComponent = <MetaData ref="md" doc={this.props.doc} onChange={this.onDocChange} />;
				}

				if (this.props.doc && this.props.doc.title) {
					var title = <h1 onClick={this.onMdClick}>{this.props.doc.title}</h1>;
				}

				if (this.props.doc && this.props.doc.subtitle) {
					var subtitle = <h4 onClick={this.onMdClick}>{this.props.doc.subtitle}</h4>;
				}

				return (
					<div className={"block type-" + this.props.type}  ref="block">
						<div className="row">
							<div className="large-12 columns">
								<Title onClick={this.onClick} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} title={this.props.blockTypeTitle} />
								{metaDataComponent}
								{title}
								{subtitle}
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
		"isaacFastTrackQuestionPage": ContentBlock,
		"isaacConceptPage": ContentBlock,
		"isaacEventPage": EventPageBlock,
		"isaacWildcard": ContentBlock,
		"page": ContentBlock,
		"isaacPageFragment": ContentBlock,
		"choice": ChoiceBlock,
		"quantity": QuantityChoiceBlock,
		"formula": FormulaChoiceBlock,
		"video": VideoBlock,
		"anvilApp": AnvilAppBlock,
		"question": QuestionBlock,
		"choiceQuestion": QuestionBlock,
		"isaacQuestion": QuestionBlock,
		"isaacMultiChoiceQuestion": QuestionBlock,
		"isaacNumericQuestion": QuestionBlock,
		"isaacSymbolicQuestion": QuestionBlock,
		"emailTemplate": EmailTemplateBlock
	};

	var displayMetadataForTypes = ["page", "emailTemplate", "isaacQuestionPage", "isaacFastTrackQuestionPage", "isaacConceptPage", "isaacWildcard", "figure", "isaacEventPage", "isaacPageFragment", "anvilApp"];

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
