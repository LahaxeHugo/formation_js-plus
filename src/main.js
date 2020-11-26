'use strict';

function getJson(url) {
  return fetch(url)
    .then(function(resp) {
      return resp.json();
    });
}

let favorites = new Set();
let localFav = localStorage.getItem('favoriteTweets');
 if(localFav && localFav !== null) {
   localFav.split(',').map(id => {favorites.add(parseInt(id))});
 }

document.addEventListener(
  'DOMContentLoaded',
  function () {
    const promise1 = getJson('https://raw.githubusercontent.com/iOiurson/data/master/data/tweets.json');
    const promise2 = getJson('https://raw.githubusercontent.com/iOiurson/formation/correction/data/tweets2.json');
    Promise.all([promise1, promise2])
      .then(function (tweetsTemp) {

        const tweets = tweetsTemp.flat();
        //console.log('Le tableau de tweet', tweets);

        // ### Projet Touitter ###
        // Attention: toucher au DOM coûte cher, utiliser le moins possible les APIs du DOM
        const body = document.querySelector('body');
        const root = document.getElementById('root');
        const buttons = document.createElement('div');
        buttons.id = 'buttons';
        root.after(buttons);

        // [1] créer une fonction createLi(), qui pour un tweet en entrée, crée et retourne un <li> contenant le texte du tweet
        function createLi(tweet) {
          let el = document.createElement('li');
          el.setAttribute('lang', tweet.lang);
          el.setAttribute('id-tweet', tweet.id);

          if(favorites.has(tweet.id)) {
            el.classList.add('favoris');
          }

          let header = document.createElement('header');
          let content = document.createElement('div');
          let footer = document.createElement('footer');
          

          let user = document.createElement('span');
          user.classList.add('user');
          user.textContent = tweet.user.name;
          header.append(user);
          let date = document.createElement('span');
          date.textContent = tweet.created_at;
          header.append(date);
          let fav = document.createElement('button');
          fav.classList.add('favoris-button');
          fav.textContent = 'Favoris';
          header.append(fav);

          let text = document.createElement('p');
          text.textContent = tweet.full_text;
          content.append(text);

          el.append(header);
          el.append(content);
          el.append(footer);

          return el;
        }

        // [2] créer et ajouter un <ol> à la page, puis y ajouter les <li> de tweets en utilisant [1]
        // let ol = document.createElement('ol');
        // ol.id = 'tweet-list';
        // root.after(ol);

        // tweets.forEach(tweet => {
        //   ol.append(createLi(tweet));
        // });

        // [3] créer un <bouton> de filtre pour que quand on clique dessus, ne garde que les tweets en français à l'écran
        // [4] modifier le bouton de filtre pour pouvoir réafficher tous les tweets quand on reclique dessus

        // let langFilter = document.createElement('button');
        // langFilter.id = 'filter-lang';
        // langFilter.textContent = 'Filtrer langue';
        // buttons.append(langFilter);

        // let toggleLang = false;
        // langFilter.addEventListener('click', () => {
        //   let tweets = document.querySelectorAll('#tweet-list > li');
        //   tweets.forEach(tweet => {
        //     let lang = tweet.getAttribute('lang');
        //     if(lang !== 'fr') {
        //       if(toggleLang === false) {
        //         tweet.style.display = 'none';
        //       } else {
        //         tweet.style.display = 'block';
        //       }
        //     }
        //   });
        //   toggleLang = !toggleLang;
        // });


        /* [5] créer une fonction createOl(), qui pour un tableau tweets en entrée, crée et retourne un <ol> rempli de <li>
    et l'utiliser à [2], [3], [4] */

        function createOl(tweets) {
          let ol = document.createElement('ol');
          ol.id = 'tweet-list';

          tweets.forEach(tweet => {
            ol.append(createLi(tweet));
          });

          return ol;
        }
        let displayedOl = createOl(tweets);
        body.append(displayedOl);

        /* [6] Créer un bouton qui, quand on clique dessus:
            - active le tracking de la souris: la console affiche position de la souris (event.clientX, event.clientY) quand la souris bouge
            - désactive le tracking quand on reclique dessus
        */
        let tracking = document.createElement('div');
        tracking.id = 'tracking-coord';
        tracking.textContent = 'x:0 y:0';
        body.append(tracking);
        
        let trackingFilter = document.createElement('button');
        trackingFilter.id = 'filter-tracking';
        trackingFilter.textContent = 'Track Mouse';
        buttons.append(trackingFilter);

        let trackingToggle = false;
        trackingFilter.addEventListener('click', function() {
            trackingToggle = !trackingToggle;
            if(trackingToggle) {
                document.addEventListener('mousemove', trackingMove);
            } else {
                document.removeEventListener('mousemove', trackingMove);
            }
        });

        function trackingMove(e) {
            tracking.textContent = 'x:'+e.clientX+' y:'+e.clientY;
        }


        /* [7] créer une fonction qui crée et renvoie le bouton de filtre.
          Cette fonction doit contenir toute la logique liée au filtre.
          Utiliser cette fonction pour remplacer le code de création du bouton de filtre.
        */
      
        function createFilter() {
          let langFilter = document.createElement('button');
          langFilter.id = 'filter-lang';
          langFilter.textContent = 'Filtrer langue';
   
          let toggleLang = false;
          langFilter.addEventListener('click', () => {            
            let newOl;
            if(toggleLang === false) {
              newOl = createOl(tweets.filter(tweet => tweet.lang === 'fr'));
            } else {
              newOl = createOl(tweets);
            }
            displayedOl.replaceWith(newOl);
            displayedOl = newOl;
            toggleLang = !toggleLang;
          });

          return langFilter;
        }
        buttons.append(createFilter());


        // [8] Utiliser la fonction getJson() pour charger les tweets à la place des lignes 6 à 11

        /* [9] Utiliser Promise.all() pour charger également les tweets de cette url :
          'https://raw.githubusercontent.com/iOiurson/formation/correction/data/tweets2.json'
        */

        // ### BONUS : LOCALSTORAGE ###

        // [1] Rajouter un bouton "fav" à chaque li

        /* [2] quand le bouton est cliqué, changer le style du li (rajouter une classe 'fav')
        + et stocker l'ensemble des id_str fav dans le localStorage */
        
        // [3] au chargement de la page, lire le localStorage pour favoriser les favoris.

        // see top "favoriteTweets"
        
        let favoris = document.querySelectorAll('#tweet-list .favoris-button');
        favoris.forEach(el => {
          el.addEventListener('click', function() {
            toggleFavorite(this.parentNode.parentNode);
          });
        });

        function toggleFavorite(node) {
          let id = parseInt(node.getAttribute('id-tweet'));
          if(favorites.has(id)) {
            node.classList.remove('favoris');
            favorites.delete(id);
          } else {
            node.classList.add('favoris');
            favorites.add(id);
          }
          localStorage.setItem('favoriteTweets', [...favorites]);
        }
      })
      .catch(function (e) {
        console.error(e);
      });
  },
  { once: true },
);
