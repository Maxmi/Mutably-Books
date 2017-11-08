$(document).ready(function() {

  //place where retrieved data will be displayed 
  const $ul = $('.list-group');

  //calling api and getting list of books to the page  
  const renderBook = (book) => {
    return $("<li></li>").addClass("list-group-item").html(`
      <button type="button" class="btn btn-info update-btn edit">Edit</button>
      <button type="button" class="btn btn-default delete">Delete</button>
      
      <div class="form-control title">${book.title}</div> 
      <div class="form-control author">${book.author}</div>
      <div class="form-control releaseDate">${book.releaseDate}</div>
      <div class="form-control image"><img src="${book.image}" class="image" height="150"/></div>
      `)
      .data("id", book._id)
  };

  // validating form for adding new item  
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
  };

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


  const saveBook = ({
    book,
    bookId
  }) => {
    return $.ajax({
      method: 'PUT',
      url: `http://mutably.herokuapp.com/books/${bookId}`,
      data: book,
      dataType: "json"
    })
  };



  const createInput = (type, cssClass, val) => {
    return $("<input/>").attr('type', type).addClass(cssClass).val(val);
  };

  /**
   * Creates new element li
   * @param  {string} cssClass cssClass to apply to li element 
   * @param  {string} text     text in li 
   * @return {jQuery.Element}
   */
  const createLi = (cssClass, text) => {
    return $("<li></li>").addClass(cssClass).text(text);
  }

  //handler for "Add your book" button 
  $("#create").on('click', (event) => {
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
  });

  const editInfo = (li) => {
    const title = li.find('.title');
    const author = li.find('.author');
    const releaseDate = li.find('.releaseDate');
    const imageWrapper = li.find('.image');
    const image = imageWrapper.find('img');

    const titleText = title.text();
    const authorText = author.text();
    const releaseDateText = releaseDate.text();
    const imageSrc = image.prop('src');

    const titleInput = createInput('text', 'title form-control', titleText);
    const authorInput = createInput('text', 'author form-control', authorText);
    const releaseDateInput = createInput('text', 'release-date form-control', releaseDateText);
    const imageInput = createInput('text', 'image-input form-control', imageSrc);

    title.remove();
    author.remove();
    releaseDate.remove();
    imageWrapper.remove();

    li.append(titleInput, authorInput, releaseDateInput, imageInput);
  };

  const saveInfo = (li) => {
    const titleInput = li.find('.title');
    const authorInput = li.find('.author');
    const releaseDateInput = li.find('.release-date');
    const imageInput = li.find('.image-input');

    saveBook({
        book: {
          title: titleInput.val(),
          author: authorInput.val(),
          releaseDate: releaseDateInput.val(),
          image: imageInput.val()
        },
        bookId: li.data("id")
      })
      .then(book => {
        li.replaceWith(renderBook(book));
      })
      .catch(err => {
        console.log(err);
      })
  };


  // //handler for "Edit" button 
  $('.books-list').on('click', '.btn.update-btn',  (event) => {
    const button = $(event.target);
    const li = button.parent();
    button.toggleClass('btn-success btn-info edit save');
    if (button.hasClass('save')) {
      button.text('Save');
      editInfo(li);
    } else {
      button.text('Edit');
      saveInfo(li);
    }
  });

  const deleteBook = (bookId) => {
    return $.ajax({
      method: 'DELETE',
      url: `http://mutably.herokuapp.com/books/${bookId}`
    })
  };

  //handler for "Delete" button 
  $(".books-list").on('click', '.btn.delete', (event) => {
    const button = $(event.target);
    const li = button.parent();
    const id = li.data("id");
    deleteBook(id)
      .then(() => {
        li.remove();
      })
      .catch((err) => {
        console.log(err);
      });
  })

  //getting books from api 
  $.ajax({
      method: "GET",
      url: "http://mutably.herokuapp.com/books",
      dataType: "json"
    })
    .then(res => {
      let content = '';
      content = res.books.map(book => renderBook(book));
      $ul.html(content);
    })
    .catch(err => {
      $ul.html('Error occured.');
    });

}); //end of doc ready