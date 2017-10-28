// <span class="title">"${book.title}"</span> 
// <span class="author">${book.author}</span>
// 
// <span class="year">${book.releaseDate}</span>
// <img src="${book.image}" class="image" height="150"/>

$(document).ready(function() {
  //place where retrieved data will be displayed 
  const $ul = $('.list-group'); 

  //function used when making ajax call to api with get method 
  const renderBook = (book) => {
    return $("<li></li>").addClass("list-group-item").html(`
      <button type="button" class="btn btn-info edit">Edit</button>
      <button type="button" class="btn btn-default delete">Delete</button>
      
      <li class="form-control title">"${book.title}"</li> 
      <li class="form-control author">${book.author}</li>
      <li class="form-control releaseDate">${book.releaseDate}</li>
      
      <li class="form-control image"><img src="${book.image}" class="image" height="150"/></li>
      `)
      .data("id", book._id)
  };

  //ajax call with method delete 
  const deleteBook = (bookId) => {
    return $.ajax({
      method: 'DELETE',
      url: `http://mutably.herokuapp.com/books/${bookId}`
    });
  };

  //ajax call with method put 
  const saveBook = (bookId, title, author) => {
    return $.ajax({
      method: 'PUT',
      url: `http://mutably.herokuapp.com/books/${bookId}`
    })
  };

  //function used for validating form for adding new item  
  const validateForm = (values) => {
    const rawErrors = Object.keys(values).map(key => {
      if (!values[key]) {
        return {
          name: key,
          error: `${key} cannot be empty`
        }
      }
      return '';
    })
    return _.compact(rawErrors);
  }

  //ajax call with method post 
  const addBook = (values) => {
    return $.ajax({
        method: "POST",
        url: "http://mutably.herokuapp.com/books",
        data: values,
        dataType: "json"
      })
      .then(book => {
        $ul.prepend(renderBook(book));
        $("#addItem")[0].reset();

      })
      .catch(err => {
        console.log(err);
      })
  };


  //functions used when editing book info 
  const createInput = (type, cssClass, val) => {
    return $("<input/>").attr('type', type).addClass(cssClass).val(val);
  };

  // const createSpan = (cssClass, text) => {
  //   return $("<span></span>").addClass(cssClass).text(text);
  // };

  const createLi = (cssClass, text) => {
    return $("<li></li>").addClass(cssClass).text(text);
  }

  //function used when "Edit" button clicked 
  const editInfo = (li) => {
    const title = li.find('.title');
    const author = li.find('.author');
    const releaseDate = li.find('.releaseDate');
    const image = li.find('.image')

    const titleText = title.text();
    const authorText = author.text();
    
    // title.removeAttr("readonly");

    const titleInput = createInput('text', 'title form-control', titleText);
    const authorInput = createInput('text', 'author form-control', authorText);
    const releaseDateInput = createInput('date', 'releaseDate form-control'); 
    // const imageInput = createInput('text', 'image form-control')
    
    title.remove();
    author.remove();
    releaseDate.remove(); 
    
    //can we instead of removing and appending new ones, just make inputs editable?
    li.append(titleInput, authorInput, releaseDateInput);
    
  };

  //function used when "Save" button clicked  
  //so far inputs are still editable even after clicking Save
  const saveInfo = (li) => {
    const titleInput = li.find('.title');
    const authorInput = li.find('.author');
    const releaseDateInput = li.find('.releaseDate');

    const titleText = titleInput.val();
    const authorText = authorInput.val();
    const releaseDateText = releaseDateInput.val();

    const titleLi = createLi('title list-group-item', titleText);
    const authorLi = createLi('author list-group-item', authorText);
    const releaseDateLi = createLi('releaseDate list-group-item', releaseDateText);
  };


  //getting books from api 
  $.ajax({
      method: "GET",
      url: "http://mutably.herokuapp.com/books",
      dataType: "json"
    })
    .then(res => {
      // console.log(res);
      let content = '';
      content = res.books.map(book => renderBook(book));
      $ul.html(content);

      //handler for "Add your book" button 
      $("#create").click((event) => {
        event.preventDefault();
        const values = {};
        $.each($('#addItem').serializeArray(), (i, field) => {
          values[field.name] = field.value;
        });
        const errors = validateForm(values);
        if (_.isEmpty(errors)) {
          addBook(values);
        } else {
          console.log(errors);
        }
      })

      //handler for "Edit" button 
      $(".btn.edit").click((event) => {
        const button = $(event.target);
        const li = button.parent();
        button.toggleClass("btn-success btn-info edit save");
        if (button.hasClass('save')) {
          button.text('Save');
          editInfo(li);
        } else {
          button.text('Edit');
        }
      });

      //handler for "Delete" button 
      $(".btn.delete").click((event) => {
        const button = $(event.target);
        const li = button.parent();
        const id = li.data("id");
        deleteBook(id).then(() => {
          li.remove();
        }).catch((err) => {
          console.log(err);
        });
      })
    })
    .catch(err => {
      $ul.html('Error occured.');
    });


}); //end of doc ready