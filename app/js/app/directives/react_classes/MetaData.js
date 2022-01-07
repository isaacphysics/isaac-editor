define(["react", "jquery"], function(React,$) {
	return function(ContentEditor, Tags, RelatedContent, LinkedGameboards, AudienceBuilder) {
		var TITLE_MAX_LENGTH = 32;

		return React.createClass({
			getInitialState: function() {

				var dip = this.props.doc.date ? ContentEditor.dateFilter(new Date(this.props.doc.date), "yyyy-MM-dd HH:mm", "UTC") : "";
				var dop = this.props.doc.date ? ContentEditor.dateFilter(new Date(this.props.doc.date), "yyyy-MM-dd HH:mm", "UTC") : "";
				var edip = this.props.doc.end_date ? ContentEditor.dateFilter(new Date(this.props.doc.end_date), "yyyy-MM-dd HH:mm", "UTC") : "";
				var edop = this.props.doc.end_date ? ContentEditor.dateFilter(new Date(this.props.doc.end_date), "yyyy-MM-dd HH:mm", "UTC") : "";
	            var bookingDeadlineInput = this.props.doc.bookingDeadline ? ContentEditor.dateFilter(new Date(this.props.doc.bookingDeadline), "yyyy-MM-dd HH:mm", "UTC") : "";
	            var bookingDeadlineOutput = this.props.doc.bookingDeadline ? ContentEditor.dateFilter(new Date(this.props.doc.bookingDeadline), "yyyy-MM-dd HH:mm", "UTC") : "";
	            var prepWorkDeadlineInput = this.props.doc.prepWorkDeadline ? ContentEditor.dateFilter(new Date(this.props.doc.prepWorkDeadline), "yyyy-MM-dd HH:mm", "UTC") : "";
	            var prepWorkDeadlineOutput = this.props.doc.prepWorkDeadline ? ContentEditor.dateFilter(new Date(this.props.doc.prepWorkDeadline), "yyyy-MM-dd HH:mm", "UTC") : "";

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
					deprecated: this.props.doc.deprecated,
					url: this.props.doc.url,
					description: this.props.doc.description,
					dateInput: dip,
					dateOutput: dop,
					end_dateInput: edip,
					end_dateOutput: edop,
	                bookingDeadlineInput: bookingDeadlineInput,
	                bookingDeadlineOutput: bookingDeadlineOutput,
	                bookingDeadlineInt: this.props.doc.bookingDeadline,
	                prepWorkDeadlineInput: prepWorkDeadlineInput,
	                prepWorkDeadlineOutput: prepWorkDeadlineOutput,
	                prepWorkDeadlineInt: this.props.doc.prepWorkDeadline,
					dateInt: this.props.doc.date,
					end_dateInt: this.props.doc.end_date,
					appId: this.props.doc.appId,
					appAccessKey: this.props.doc.appAccessKey,
					location: this.props.doc.location || {},
					supersededBy: this.props.doc.supersededBy,
	                isaacGroupToken: this.props.doc.isaacGroupToken,
					allowGroupReservations: this.props.doc.allowGroupReservations,
					groupReservationLimit: this.props.doc.groupReservationLimit,
					numberOfPlaces: this.props.doc.numberOfPlaces,
					eventStatus: this.props.doc.eventStatus,
					emailEventDetails: this.props.doc.emailEventDetails,
					emailConfirmedBookingText: this.props.doc.emailConfirmedBookingText,
					emailWaitingListBookingText: this.props.doc.emailWaitingListBookingText,
					preResources: this.props.doc.preResources,
					postResources: this.props.doc.postResources,
					audience: this.props.doc.audience,
					visibleToStudents: this.props.doc.visibleToStudents,
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

			onLinkedGameboardsChange: function(c, oldLinkedGameboards, newLinkedGameboards) {
				var oldDoc = this.props.doc;
				var newDoc = $.extend({}, oldDoc);
				newDoc.linkedGameboards = newLinkedGameboards;

				this.onDocChange(this, oldDoc, newDoc);
			},

			onTextboxChange: function(key, e) {
				var newState = {};
				newState[key] = e.target.value;
				this.setState(newState);

				clearTimeout(this.metadataChangeTimeout);
				this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
			},

			onDropdownChange: function(key, e) {
				var newState = {};
				newState[key] = e.target.value;
				this.setState(newState);

				clearTimeout(this.metadataChangeTimeout);
				this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
			},

			onDeprecatedChange: function(e) {
				this.onCheckboxChange.bind(this, "deprecated")(e);

				const oldTags = this.props.doc.tags !== undefined && this.props.doc.tags !== null ? this.props.doc.tags : [];
				let newTags = undefined;

				if (e.target.checked && !oldTags.includes("nofilter")) {
					newTags = oldTags.concat(["nofilter"]);
				} else if (!e.target.checked) {
					newTags = oldTags.filter(s => s !== "nofilter");
				}

				if (newTags !== undefined) {
					this.onTagsChange(e, this.props.doc.tags, newTags);
				}
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

			onend_dateChange: function(e) {
				var newVal = e.target.value;
				this.setState({
					end_dateInput: newVal,
				});

				var d = Date.parse(newVal.replace(/\-/g, "/"));
				if (d) {
					dt = new Date(d);
					this.setState({
						end_dateOutput: ContentEditor.dateFilter(dt, "yyyy-MM-dd HH:mm", "UTC"),
						end_dateInt: d,
					});

					clearTimeout(this.metadataChangeTimeout);
					this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);

				}
			},

	        onBookingDeadlineChange: function(e) {
				var newVal = e.target.value;
				this.setState({
					bookingDeadlineInput: newVal,
				});

				var d = Date.parse(newVal.replace(/\-/g, "/"));
				if (d) {
					dt = new Date(d);
					this.setState({
	                    bookingDeadlineOutput: ContentEditor.dateFilter(dt, "yyyy-MM-dd HH:mm", "UTC"),
	                    bookingDeadlineInt: d,
					});

					clearTimeout(this.metadataChangeTimeout);
					this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);

				}
			},

	        onPrepWorkDeadlineChange: function(e) {
				var newVal = e.target.value;
				this.setState({
					prepWorkDeadlineInput: newVal,
				});

				var d = Date.parse(newVal.replace(/\-/g, "/"));
				if (d) {
					dt = new Date(d);
					this.setState({
	                    prepWorkDeadlineOutput: ContentEditor.dateFilter(dt, "yyyy-MM-dd HH:mm", "UTC"),
	                    prepWorkDeadlineInt: d,
					});

					clearTimeout(this.metadataChangeTimeout);
					this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);

				}
			},

			onAudienceChange: function(audience) {
				this.setState({audience});
				clearTimeout(this.metadataChangeTimeout);
				this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
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

				if (this.state.deprecated === true || this.state.deprecated === false) {
					newDoc.deprecated = this.state.deprecated;
				}

				if (this.state.visibleToStudents === true || this.state.visibleToStudents === false) {
					newDoc.visibleToStudents = this.state.visibleToStudents;
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

				if (this.state.end_dateInt || this.props.doc.end_dateInt) {
					newDoc.end_date = this.state.end_dateInt;
				}

				if (this.state.bookingDeadlineInt || this.props.doc.bookingDeadlineInt) {
					newDoc.bookingDeadline = this.state.bookingDeadlineInt;
				}

				if (this.state.prepWorkDeadlineInt || this.props.doc.prepWorkDeadlineInt) {
					newDoc.prepWorkDeadline = this.state.prepWorkDeadlineInt;
				}

				if (this.state.isaacGroupToken || this.props.doc.isaacGroupToken) {
					newDoc.isaacGroupToken = this.state.isaacGroupToken;
				}

				if (this.state.allowGroupReservations || this.props.doc.allowGroupReservations) {
					newDoc.allowGroupReservations = this.state.allowGroupReservations;
				}

				if (this.state.groupReservationLimit || this.props.doc.groupReservationLimit) {
					newDoc.groupReservationLimit = this.state.groupReservationLimit;
				}

				if (this.state.numberOfPlaces || this.props.doc.numberOfPlaces) {
					newDoc.numberOfPlaces = this.state.numberOfPlaces;
				}

				if (this.state.eventStatus || this.props.doc.eventStatus) {
					newDoc.eventStatus = this.state.eventStatus;
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

				if (this.state.supersededBy != null || this.props.doc.supersededBy) {
					newDoc.supersededBy = this.state.supersededBy;
				}

				if (this.state.emailEventDetails || this.props.doc.emailEventDetails) {
					newDoc.emailEventDetails = this.state.emailEventDetails;
				}

				if (this.state.emailConfirmedBookingText || this.props.doc.emailConfirmedBookingText) {
					newDoc.emailConfirmedBookingText = this.state.emailConfirmedBookingText;
				}

				if (this.state.emailWaitingListBookingText || this.props.doc.emailWaitingListBookingText) {
					newDoc.emailWaitingListBookingText = this.state.emailWaitingListBookingText;
				}

				if (this.state.audience || this.props.doc.audience) {
					newDoc.audience = this.state.audience;
				}

				this.onDocChange(this, oldDoc, newDoc);
			},

			onLocationChange: function(field, e) {
				newState = $.extend({}, this.state);
				if (field.indexOf('address.') >= 0) {
	                newState.location.address[field.split('.')[1]] = e.target.value;
	            } else {
	                newState.location[field] = e.target.value;
				}

				this.setState(newState);
				clearTimeout(this.metadataChangeTimeout);
				this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
			},

			onResourceChange: function(resourceType, resources, index, key, e) {
				var newObjectState = {};
				resources[index][key] = e.target.value;
				newObjectState[resourceType] = resources;
				this.setState(newObjectState);

				clearTimeout(this.metadataChangeTimeout);
				this.metadataChangeTimeout = setTimeout(this.onMetadataChangeTimeout, 500);
			},

			addResource: function(resourceType) {
				var newObjectState = {};
				resources = this.state[resourceType];
				resources.push({title:"Event brochure", url:"somewhere/interesting.pdf"});
				newObjectState[resourceType] = resources;
				this.setState(newObjectState);
			},

			generateResourceElements: function(resourceType) {
				var removeResource = function(index) {
					var newObjectState = {};
					resources = this.state[resourceType];
					resources.splice(index, 1);
					newObjectState[resourceType] = resources;
					this.setState(newObjectState);
				}

				return this.state[resourceType].map(function(resource, index, resources) {
					return (
						<div className="row">
							<div >
								<div className="small-5 small-offset-2 columns"><input type="text" value={resource.title} onChange={this.onResourceChange.bind(this, resourceType, resources, index, "title")} /></div>
								<div className="small-4 columns"><input type="text" value={resource.url} onChange={this.onResourceChange.bind(this, resourceType, resources, index, "url")} /></div>
								<div className="small-1 columns end"><button onClick={removeResource.bind(this, index)} className="button tiny round alert">x</button></div>
							</div>
						</div>
					);
				}.bind(this));
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
						<div className="small-2 columns text-right"><span className="metadataLabel">Attribution:</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.attribution} onChange={this.onTextboxChange.bind(this, "attribution")} /></div>
					</div>;
				}

				if (this.props.doc.type == "emailTemplate" || this.props.doc.type == "isaacPod") {
					var published = [
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Published?</span></div>
							<div className="small-10 columns"><input type="checkbox" checked={!!this.state.published} onChange={this.onCheckboxChange.bind(this, "published")} /> </div>
						</div>
					]
				}

				if (this.props.doc.type == "isaacConceptPage" || this.props.doc.type == "isaacTopicSummaryPage" || this.props.doc.type == "page" || this.props.doc.type == "isaacPageFragment") {
					var summary = <div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Summary:</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.summary} onChange={this.onTextboxChange.bind(this, "summary")} /> </div>
					</div>
				}

				if (this.props.doc.type == "isaacQuestionPage" || this.props.doc.type == "isaacFastTrackQuestionPage" || this.props.doc.type == "isaacConceptPage" || this.props.doc.type == "isaacTopicSummaryPage" || this.props.doc.type == "page" || this.props.doc.type == "isaacPageFragment" || this.props.doc.type == "isaacEventPage") {
					var pageMeta = [
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Published?</span></div>
							<div className="small-10 columns"><input type="checkbox" checked={!!this.state.published} onChange={this.onCheckboxChange.bind(this, "published")} /> </div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Deprecated?</span></div>
							<div className="small-10 columns"><input type="checkbox" checked={!!this.state.deprecated} onChange={this.onDeprecatedChange} /> </div>
						</div>
					];

					var audience = <div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Audience:</span></div>
						<div className="small-10 columns">
							<AudienceBuilder audience={this.state.audience} onAudienceChange={this.onAudienceChange} />
						</div>
					</div>;

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
							<div className="small-2 columns text-right"><span className="metadataLabel">Email Event Details:</span></div>
							<div className="small-10 columns"><textarea value={this.state.emailEventDetails} onChange={this.onTextboxChange.bind(this, "emailEventDetails")}></textarea></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Email Confirmed Booking Text:</span></div>
							<div className="small-10 columns"><textarea value={this.state.emailConfirmedBookingText} onChange={this.onTextboxChange.bind(this, "emailConfirmedBookingText")}></textarea></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Email Waiting List Booking Text:</span></div>
							<div className="small-10 columns"><textarea value={this.state.emailWaitingListBookingText} onChange={this.onTextboxChange.bind(this, "emailWaitingListBookingText")}></textarea></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Start Date<br/><small><code>YYYY-MM-DD HH:mm</code></small></span></div>
							<div className="small-5 columns"><input type="text" value={this.state.dateInput} onChange={this.onDateChange} /></div>
							<div className="small-5 columns">{this.state.dateOutput}</div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">End Date<br/><small><code>YYYY-MM-DD HH:mm</code></small></span></div>
							<div className="small-5 columns"><input type="text" value={this.state.end_dateInput} onChange={this.onend_dateChange} /></div>
							<div className="small-5 columns">{this.state.end_dateOutput}</div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Booking Deadline<br/><small><code>YYYY-MM-DD HH:mm</code></small></span></div>
							<div className="small-5 columns"><input type="text" value={this.state.bookingDeadlineInput} onChange={this.onBookingDeadlineChange} /></div>
							<div className="small-5 columns">{this.state.bookingDeadlineOutput}</div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Prep-work Deadline<br/><small><code>YYYY-MM-DD HH:mm</code></small></span></div>
							<div className="small-5 columns"><input type="text" value={this.state.prepWorkDeadlineInput} onChange={this.onPrepWorkDeadlineChange} /></div>
							<div className="small-5 columns">{this.state.prepWorkDeadlineOutput}</div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Number of places</span></div>
							<div className="small-5 columns end"><input type="text" value={this.state.numberOfPlaces} onChange={this.onTextboxChange.bind(this, "numberOfPlaces")} /></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Status</span></div>
							<div className="small-5 columns end">
								<select value={this.state.eventStatus} onChange={this.onDropdownChange.bind(this, "eventStatus")}>
									<option value="OPEN">Open</option>
									<option value="CANCELLED">Cancelled</option>
									<option value="CLOSED">Closed</option>
									<option value="WAITING_LIST_ONLY">Waiting List Only</option>
								</select>
							</div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Location</span></div>
							<div className="small-5 columns end">
								<input type="text" placeholder="Address Line 1" value={this.state.location.address.addressLine1} onChange={this.onLocationChange.bind(this, "address.addressLine1")} />
								<input type="text" placeholder="Address Line 2" value={this.state.location.address.addressLine2} onChange={this.onLocationChange.bind(this, "address.addressLine2")} />
								<input type="text" placeholder="Town" value={this.state.location.address.town} onChange={this.onLocationChange.bind(this, "address.town")} />
								<input type="text" placeholder="County" value={this.state.location.address.county} onChange={this.onLocationChange.bind(this, "address.county")} />
								<input type="text" placeholder="Postal Code" value={this.state.location.address.postalCode} onChange={this.onLocationChange.bind(this, "address.postalCode")} />
							</div>
							<div className="small-offset-2 small-10 columns">
								<div className="small-2 columns text-right"><span className="metadataLabel">Longitude</span></div>
								<div className="small-4 columns"><input type="text" placeholder="Longitude" value={this.state.location.longitude} onChange={this.onLocationChange.bind(this, "longitude")} /></div>
								<div className="small-2 columns text-right"><span className="metadataLabel">Latitude</span></div>
								<div className="small-4 columns end"><input type="text" placeholder="Latitude" value={this.state.location.latitude} onChange={this.onLocationChange.bind(this, "latitude")} /></div>
							</div>
						</div>,
						<div className="row">
	                        <div className="small-2 columns text-right"><span className="metadataLabel">Isaac Group Token:</span></div>
	                        <div className="small-5 columns end"><input type="text" value={this.state.isaacGroupToken} onChange={this.onTextboxChange.bind(this, "isaacGroupToken")} /></div>
	                    </div>,
						<div className="row">
							<div className="small-2 columns text-right">Reservations</div>
							<div className="small-1 columns text-right"><span className="metadataLabel">Enabled:</span></div>
							<div className="small-1 columns"><input type="checkbox" checked={!!this.state.allowGroupReservations} onChange={this.onCheckboxChange.bind(this, "allowGroupReservations")} /></div>
							<div className="small-2 columns text-right"><span className="metadataLabel">Per-teacher Limit:</span></div>
							<div className="small-1 columns end"><input type="text" value={this.state.groupReservationLimit || 10} onChange={this.onTextboxChange.bind(this, "groupReservationLimit")} /></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Pre-Resources:</span></div>
							<div className="small-5 columns"><span className="metadataLabel">Title</span></div>
							<div className="small-5 columns"><span className="metadataLabel">URL</span></div>
						</div>,
						this.generateResourceElements('preResources'),
						<div className="row">
							<div className="small-4 small-offset-2 columns end"><button onClick={this.addResource.bind(this, 'preResources')} className="button tiny round">Add Pre-Resource</button></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Post-Resources:</span></div>
							<div className="small-5 columns"><span className="metadataLabel">Title</span></div>
							<div className="small-5 columns"><span className="metadataLabel">URL</span></div>
						</div>,
						this.generateResourceElements('postResources'),
						<div className="row">
							<div className="small-4 small-offset-2 columns end"><button onClick={this.addResource.bind(this, 'postResources')} className="button tiny round">Add Post-Resource</button></div>
						</div>,
					];
				}

				if (this.props.doc.type == "isaacQuestionPage" || this.props.doc.type == "isaacFastTrackQuestionPage" ||
					this.props.doc.type == "isaacConceptPage" || this.props.doc.type == "page") { // FIXME Needs refactoring
					var questionPageMeta = <div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Attribution:</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.attribution} onChange={this.onTextboxChange.bind(this, "attribution")} /></div>
					</div>;

					var levelMeta = <div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Level:</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.level} onChange={this.onTextboxChange.bind(this, "level")} /></div>
					</div>;

					var supersededByMeta = <div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Superseded by:</span></div>
						<div className="small-10 columns"><input type="text" value={this.state.supersededBy} onChange={this.onTextboxChange.bind(this, "supersededBy")} /></div>
					</div>;
				}

				if (this.props.doc.type == "isaacQuiz") {
					var quizPageMeta = [
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Level:</span></div>
							<div className="small-10 columns"><input type="text" value={this.state.level} onChange={this.onTextboxChange.bind(this, "level")} /></div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Visible to students?</span></div>
							<div className="small-10 columns"><input type="checkbox" checked={!!this.state.visibleToStudents} onChange={this.onCheckboxChange.bind(this, "visibleToStudents")} /> </div>
						</div>,
						<div className="row">
							<div className="small-2 columns text-right"><span className="metadataLabel">Published?</span></div>
							<div className="small-10 columns"><input type="checkbox" checked={!!this.state.published} onChange={this.onCheckboxChange.bind(this, "published")} /> </div>
						</div>,
					];
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

				if (this.props.doc.type == "isaacTopicSummaryPage") {
					var linkedGameboards = <div className="row">
						<div className="small-2 columns text-right"><span className="metadataLabel">Gameboards: </span></div>
						<div className="small-10 columns">
							<LinkedGameboards linkedGameboards={this.props.doc.linkedGameboards || []} onChange={this.onLinkedGameboardsChange} />
						</div>
					</div>;
				}

				var titleGreaterThanMaxLength = this.props.doc.title && this.props.doc.title.length > TITLE_MAX_LENGTH;
				var idInvalid = this.props.doc.id && !this.props.doc.id.match(/^[a-z0-9_-]+$/);

				return (
					<div className="metadata-container">
						<button onClick={this.toggleMetaData_click} className="button tiny round" ref="toggleButton">Show MetaData</button>
						<div className="metadata" ref="metadata">
							{audience}
							<div className="row">
								<div className="small-2 columns text-right"><span className="metadataLabel">Tags: </span></div>
								<div className="small-10 columns">{tagsComponent}</div>
							</div>
							<div className="row">
								{idInvalid && <div className="columns text-right">Please alter this ID, as it does not match our required style</div>}
								<div className="small-2 columns text-right"><span className="metadataLabel">ID: </span></div>
								<div className="small-10 columns"><input type="text" value={this.state.id} onChange={this.onTextboxChange.bind(this, "id")} style={{color: idInvalid ? "red" : "black"}} /></div>
							</div>
							<div className="row">
								{titleGreaterThanMaxLength && <div className="columns text-right">This title is a little long, consider rephrasing 🙂</div>}
								<div className="small-2 columns text-right"><span className="metadataLabel">Title: </span></div>
								<div className="small-10 columns"><input type="text" value={this.state.title} onChange={this.onTextboxChange.bind(this, "title")} style={{color: titleGreaterThanMaxLength ? "red" : "black"}} /></div>
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
							{supersededByMeta}
							{pageMeta}
							{summary}
							{linkedGameboards}
							{eventMetadata}
							{published}
							{anvilAppMeta}
							{quizPageMeta}
						</div>
					</div>
				);
			}
		});
	}
})
