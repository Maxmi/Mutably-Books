$(document).ready(function() {

  //place where retrieved data will be displayed 
  const $ul = $('.list-group');

  //adding individual book to the page  
  const renderBook = book => {
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
  const validateForm = values => {
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

//making POST request to api - creating new item 
  const addBook = values => {
    return fetch('http://mutably.herokuapp.com/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
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
      addBook(values)
        .then(res => {
          return res.json();
        })
        .then(book => {
          $ul.prepend(renderBook(book));
          $('#addItem')[0].reset();
        })
        .catch(err => {
          console.log(err);
        })
    } else {
      console.log(errors);
    }
  });

  //create new fields for saving updated book info 
  const createInput = (type, cssClass, val) => {
    return $("<input/>").attr('type', type).addClass(cssClass).val(val);
  };
  
  //when clicking on Edit button:
  //finding input fields
  //getting their text values
  //creating new input fields with those values
  //removing old input fields
  //inserting new input fields into li element
  const editInfo = li => {
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

//making PUT request to api - updating book info 
  const saveBook = ({
    book,
    bookId
    }) => {
    return fetch(`http://mutably.herokuapp.com/books/${bookId}`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
      },
        body: JSON.stringify(book)
      }
  )};

//saving updated info 
  const saveInfo = li => {
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
      bookId: li.data('id')
    })
      .then(res => {
        return res.json();
      })
      .then(book => {
        li.replaceWith(renderBook(book));
        console.log(`Book with id ${book._id} has been updated`);
      })
      .catch(err => {
        console.log(err);
      })
  };


  //handler for "Edit" button 
  $('.books-list').on('click', '.btn.update-btn', (event) => {
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

//makind DELETE request to api - deleting an item 
  const deleteBook = bookId => {
    return fetch(`http://mutably.herokuapp.com/books/${bookId}`, {
      method: 'DELETE'
    })
  };


  //handler for "Delete" button 
  $('.books-list').on('click', '.btn.delete', (event) => {
    const button = $(event.target);
    const li = button.parent();
    const id = li.data('id');
    deleteBook(id)
      .then(() => {
        li.remove();
        console.log(`Book with id ${id} has been removed`);
      })
      .catch((err) => {
        console.log(err);
      });
  });

//making GET request to api - getting all books 
  const getBooks = () => {
    return fetch('http://mutably.herokuapp.com/books');
  };

//rendering retrieved info on the page - inserting into ul element 
  const displayBooks = () => {
    getBooks()
      .then(res => {
        return res.json();
      })
      .then(res => {
        let content = '';
        content = res.books.map(book => renderBook(book));
        $ul.html(content);
      })
      .catch(err => {
        $ul.html('Error occured.');
      });
  };
  
  displayBooks();

}); //end of doc ready