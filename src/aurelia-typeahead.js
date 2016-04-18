import {inject} from 'aurelia-dependency-injection';
import {bindable, customElement} from 'aurelia-templating';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Configure} from './configure';

import 'wamda-typeahead';
import $ from 'jquery';
import {Bloodhound} from 'typeahead.js-jspm';

@customElement('aurelia-typeahead')
@inject(Element, Configure, EventAggregator)

export class AureliaTypeahead {
  @bindable typeaheadOptions;
  @bindable bloodhoundOptions;
  @bindable basicSource;
  @bindable value;
  @bindable class;
  @bindable type;
  @bindable placeholder;

  constructor(element, configure, eventAggregator) {
    this.element = element;
    this.config = configure;
    this.event = eventAggregator;
  }
  attached() {
    if (this.bloodhoundOptions) {
      this.initializeBloodhound();
    } else if (this.basicSource) {
      this.engine = this.substringMatcher(this.basicSource);
    }
    this.initializeTypeAhead();
  }

  initializeBloodhound() {
    let self = this;
    self.engine = new Bloodhound({
      local: self.bloodhoundOptions.local,
      remote: self.bloodhoundOptions.remote,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      datumTokenizer: Bloodhound.tokenizers.whitespace
    });
  }
  initializeTypeAhead() {
    let self = this;
    $(this.typeaheadDiv).typeahead({
      highlight: self.typeaheadOptions.highlight ? self.typeaheadOptions.highlight : false,
      hint: self.typeaheadOptions.hint ? self.typeaheadOptions.hint : true,
      minLength: self.typeaheadOptions.minLength ? self.typeaheadOptions.minLength : 1,
      classNames: self.typeaheadOptions.classNames ? self.typeaheadOptions.classNames : ''
    }, {
      name: self.typeaheadOptions.name ? self.typeaheadOptions.name : 'typeahead',
      display: self.typeaheadOptions.display ? self.typeaheadOptions.display : '',
      source: self.engine,
      limit: self.typeaheadOptions.limit ? self.typeaheadOptions.limit : 5,
      templates: {
        notFound: self.typeaheadOptions.notFound ? self.typeaheadOptions.notfound : 'No results were found',
        pending: self.typeaheadOptions.pending ? self.typeaheadOptions.pending : 'Pending...',
        header: self.typeaheadOptions.header ? self.typeaheadOptions.header : '',
        footer: self.typeaheadOptions.footer ? self.typeaheadOptions.footer : '',
        suggestion: self.typeaheadOptions.suggestion ? self.typeaheadOptions.suggestion : ''
      }
    }).bind('typeahead:select', (event, data) => {
      self.event.publish('typeahead:select', {event: event, suggestion: data});
    }).bind('typeahead:active', () => {
      self.event.publish('typeahead:active');
    }).bind('typeahead:idle', () => {
      self.event.publish('typeahead:idle');
    }).bind('typeahead:open', () => {
      self.event.publish('typeahead:open');
    }).bind('typeahead:close', () => {
      self.event.publish('typeahead:close');
    }).bind('typeahead:change', () => {
      self.event.publish('typeahead:change');
    }).bind('typeahead:render', (ev, suggestions, async, name) => {
      self.event.publish('typeahead:render', {event: ev, suggestions: suggestions, async: async, name: name});
    }).bind('typeahead:autocomplete', (ev, suggestion) => {
      self.event.publish('typeahead:autocomplete', {event: ev, suggestion: suggestion});
    }).bind('typeahead:cursorchange', (ev, suggestion) => {
      self.event.publish('typeahead:cursorchange', {event: ev, suggestion: suggestion});
    });
  }

  substringMatcher(strs) {
    return function findMatches(q, cb) {
      let matches;
      let substrRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  }

}
