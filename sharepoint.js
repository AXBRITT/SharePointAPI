var $ = JQuery

// function to DELETE a list item from a SharePoint List
function DELETE (webURL, listName, itemID, callback) {
  var contextURL = '/_api/contextinfo'
  var listURL = "/_api/web/lists/GetByTitle('" + listName + "')/Items(" + itemID + ')/'
  var fullURL = webURL + contextURL
  $.ajax({
    url: fullURL,
    type: 'POST',
    headers: { 'Accept': 'application/json;odata=verbose' },
    success: function (context) {
      fullURL = webURL + listURL
      $.ajax({
        url: fullURL,
        type: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose', 'X-RequestDigest': context.d.GetContextWebInformation.FormDigestValue, 'content-Type': 'application/json;odata=verbose', 'X-HTTP-Method': 'DELETE', 'If-Match': '*' },
        success: function (reply) {
          callback(reply)
        },
        error: function (response) {
          console.log('error during POST: ' + JSON.stringify(response))
        }
      })
    },
    error: function (response) {
      console.log('error getting context: ' + JSON.stringify(response))
    }
  })
}
// function to MERGE changes to existing sharepoint items
function MERGE (webURL, listName, thisData, itemID, callback) {
  var listTypeURL = "/_api/web/lists/GetByTitle('" + listName + "')/ListItemEntityTypeFullName"
  var contextURL = '/_api/contextinfo'
  var listURL = "/_api/web/lists/GetByTitle('" + listName + "')/Items(" + itemID + ')/'
  var fullURL = webURL + listTypeURL
  $.ajax({
    url: fullURL,
    type: 'GET',
    headers: { 'Accept': 'application/json;odata=verbose' },
    success: function (data) {
      var metaData = {
        '__metadata': {
          'type': data.d.ListItemEntityTypeFullName
        }
      }
      var fullData = $.extend(metaData, thisData)
      fullURL = webURL + contextURL
      $.ajax({
        url: fullURL,
        type: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose' },
        success: function (context) {
          fullURL = webURL + listURL
          $.ajax({
            url: fullURL,
            type: 'POST',
            headers: { 'Accept': 'application/json;odata=verbose', 'X-RequestDigest': context.d.GetContextWebInformation.FormDigestValue, 'content-Type': 'application/json;odata=verbose', 'X-HTTP-Method': 'MERGE', 'If-Match': '*' },
            data: JSON.stringify(fullData),
            success: function (reply) {
              callback(reply)
            },
            error: function (response) {
              console.log('error during POST: ' + JSON.stringify(response))
            }
          })
        },
        error: function (response) {
          console.log('error getting context: ' + JSON.stringify(response))
        }
      })
    },
    error: function (response) {
      console.log('error getting list type: ' + JSON.stringify(response))
    }
  })
}
// function to GET data from a sharepoint list
function GET (webURL, apiURL, callback) {
  var fullURL = webURL + apiURL
  var results = []
  function loadData () {
    $.ajax({
      url: fullURL,
      type: 'GET',
      headers: { 'Accept': 'application/json;odata=verbose' },
      success: function (data) {
        if (data.d.results) {
          $.merge(results, data.d.results)
          if (data.d.__next) {
            fullURL = data.d.__next
            loadData()
          } else {
            callback(results)
          }
        } else {
          callback(data.d)
        }
      },
      error: function (response) {
        console.log('error: ' + JSON.stringify(response))
      }
    })
  }
  loadData()
}
// function to POST new data to a sharepoint list
function POST (webURL, listName, thisData, callback) {
  var listTypeURL = "/_api/web/lists/GetByTitle('" + listName + "')/ListItemEntityTypeFullName"
  var contextURL = '/_api/contextinfo'
  var listURL = "/_api/web/lists/GetByTitle('" + listName + "')/Items"
  var fullURL = webURL + listTypeURL
  $.ajax({
    url: fullURL,
    type: 'GET',
    headers: { 'Accept': 'application/json;odata=verbose' },
    success: function (data) {
      var metaData = {
        '__metadata': {
          'type': data.d.ListItemEntityTypeFullName
        }
      }
      var fullData = $.extend(metaData, thisData)
      fullURL = webURL + contextURL
      $.ajax({
        url: fullURL,
        type: 'POST',
        headers: { 'Accept': 'application/json;odata=verbose' },
        success: function (context) {
          fullURL = webURL + listURL
          $.ajax({
            url: fullURL,
            type: 'POST',
            headers: { 'Accept': 'application/json;odata=verbose', 'X-RequestDigest': context.d.GetContextWebInformation.FormDigestValue, 'content-Type': 'application/json;odata=verbose' },
            data: JSON.stringify(fullData),
            success: function (response) {
              callback(response)
            },
            error: function (response) {
              console.log('error during POST: ' + JSON.stringify(response))
              callback(response)
            }
          })
        },
        error: function (response) {
          console.log('error getting context: ' + JSON.stringify(response))
        }
      })
    },
    error: function (response) {
      console.log('error getting list type: ' + JSON.stringify(response))
    }
  })
}
