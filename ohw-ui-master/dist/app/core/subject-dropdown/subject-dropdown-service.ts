'use strict';

import * as $ from 'jquery';

export default function(AppState, Preferences, $document) {

  const menuItemTemplate = `<div class="subject-button" data-type="product-option" data-product="%ID%">%NAME%</div>`;

  // The display name for the subject dropdown works for MathX and FPP products but needs tuning for
  // ebooks and ihdp, in which there are no standards records, so there's no stand_classification.product_id
  // to pair with the product_line to map to a product_name.
  // The server really should be taking care of this, but for now, it's not, so it's on the front-end to handle
  // the product_line for 'ebook' and 'ihdp'.
  function getDisplayName(item) {
    var displayName = item.product_name ? item.product_name.replace('MathX', 'Math<sup>x</sup>') : item.name;
    if (item.product_line.toLowerCase() === 'ebook' || item.product_line.toLowerCase() === 'ihdp') {
      var bookFilter = AppState.get('books').filter(b => parseInt(b.book_id, 10) === parseInt(item.book_id, 10));
      var book = bookFilter[0];
      displayName = book && book.book_name || '';
    }
    return displayName;
  }

  this.getStarted = function() {
    var productDropdown = Preferences.get('productDropdown');
    var noDups = [], products = [];
    AppState.get('courses').forEach((item) => {
      // Don't know why the condition was added to exclude product_line ihdp from the list. Commenting it out.
      //if (item.product_line !== 'ihdp') {
        var nameDisplay = getDisplayName(item);
        var name = item.product_name || item.name;
        var state = item.product_state || '';
        var productId = item.book_id;
        if (noDups.indexOf(name) === -1) {
          noDups.push(name);
          products.push({ nameDisplay: nameDisplay, name: name, state: state,
            productId: productId, selected: name === productDropdown });
        }
      //}
    });

    products.sort((a, b) => { return a.name < b.name ? -1 : 1; });
/*
    if (subjects.length > 10) {
      subjects.unshift('Select Product');
    }
*/
    return products;
//    getProductData(subjects);
  };

  this.retrieveProductSelection = function() {
    return Preferences.get('productDropdown') || '';
  };

  this.saveProductSelection = function(product) {
    Preferences.set('productDropdown', product);
  };

  this.getCourseSubset = function(product) {
    var courseSubset = AppState.get('courses').filter((item) => {
      return item.product_name === product;
    });
    return courseSubset;
  };

  // This should fire when the document is clicked outside the dropdown menu.
  // It enables the dropdown to be dismissed without requireing a click on the product name
  // or the selection of a product.
  var hideProductDropdown = function() {
    var el = $(document).find('.subject-dropdown-wrap');
    el.removeClass('selected');
    el.slideUp();
    $document.unbind('click', hideProductDropdown);
  };

  this.toggleProductDropdown = function(evt) {
    evt.stopPropagation();
    var el = $(document).find('.subject-dropdown-wrap');
    var selected = el.hasClass('selected');
    if (selected) {
      $document.unbind('click', hideProductDropdown);
      el.removeClass('selected');
      el.slideUp();
    } else {
      $document.bind('click', hideProductDropdown);
      el.addClass('selected');
      el.slideDown();
    }
  };

};
