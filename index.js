const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''
  //processing
  data.forEach(item => {
    // title , image
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="movie poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
            <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
          </div>
        </div>
      </div>
    </div>`

  })

  dataPanel.innerHTML = rawHTML
}


function renderPaginator(amount) {
  // 80 / 12 = 6 ... 8 = 7
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
  }

  paginator.innerHTML = rawHTML

}


//page -> 回傳每頁陣列
function getMoivesByPage(page) {
  //page 1 -> movies 0-11
  //page 1 -> movies 12-23
  // ....
  // movies? 'movies' ; 'filteredMovies'
  const data = filteredMovies.length ? filteredMovies : movies  //如果有長度,給我filterdMovies 沒有的話給我movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)

}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date : ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" class="card-img-top" alt="movie poster" class='img-fluid' >`
  })

}

function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // } find裡面的函式
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  // .some用法跟find一樣,但是只會回答true or false
  if (list.some(movie => movie.id === id)) {
    return alert('電影已經有了啦！')
  }

  list.push(movie)
  // const jsonString = JSON.stringify(list) 
  // console.log('json string: ', jsonString)
  // console.log('json object: ',, JSON.parse(jsonString))
  console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') {  // 'A' 代表的是<a></a>
    return
  }
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoivesByPage(page))

})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  // console.log(searchInput.value)

  const keyword = searchInput.value.trim().toLowerCase()
  // if (!keyword.length) {  //如果keyword.length = 0 這邊會產生bullen是false,所以加一個驚嘆號代表相反為true的狀況
  //   return alert('please enter a valid string!')
  // }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) { 
  //     filteredMovies.push(movie)
  //   }
  // }
  // 使用另一種條件函示
  // filteredMovies = movies.filter(movie => {
  //   return movie.title.toLowerCase().includes(keyword)
  // })

  // map filter reduce 要多學習
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword:' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoivesByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  // Array(80)
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }

  // movies.push(...response.data.results) 尚未有分頁時的寫法
  // renderMovieList(movies)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoivesByPage(1))


})
// 測試localStorage
// localStorage.setItem('default_language', 'english')
// console.log(localStorage.getItem('default_language'))
// localStorage.removeItem('default_language')
// console.log(localStorage.getItem('default_language'))
localStorage.setItem('default_language', JSON.stringify())
