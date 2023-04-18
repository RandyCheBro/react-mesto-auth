import React, { useEffect, useState } from 'react';
import Header from './Header.js';
import Main from './Main.js';
import Footer from './Footer.js';
import PopupWithForm from './PopupWithForm.js';
import AddPlacePopup from './AddPlacePopup.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import ConfirmPopup from './ConfirmPopup.js';
import ImagePopup from './ImagePopup.js';
import api from '../utils.js/Api.js';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';


function App() {
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = React.useState(false);

  const [selectedCard, setSelectedCard] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = useState([]);
  const isOpen = isAddPlacePopupOpen || isEditProfilePopupOpen || isEditAvatarPopupOpen || isConfirmPopupOpen || selectedCard;

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleConfirmClick() {
    setIsConfirmPopupOpen(true);
  }

  function closeAllPopups() {
    setIsAddPlacePopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsConfirmPopupOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }


  useEffect(() => {

    function closeByEscape(evt) {
      if (evt.key === 'Escape') {
        closeAllPopups();
      }
    }

    function closeAllPopupsByOverlay(evt) {
      if (evt.target.classList.contains("popup_is-opened")) {
        closeAllPopups();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', closeByEscape);
      document.addEventListener('mousedown', closeAllPopupsByOverlay);
      return () => {
        document.removeEventListener('keydown', closeByEscape);
        document.removeEventListener('mousedown', closeAllPopupsByOverlay);
      }
    }
  }, [isOpen])

  React.useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userData, cards]) => {
        setCurrentUser(userData)
        setCards(cards)
      })
      .catch((err) => console.log(err))
  }, [])

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((err) => console.log(err))
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== card._id));
      })
      .catch((err) => console.log(err))
  }

function handleUpdateUser({name, about}){
  api.changeData({name, about})
  .then((data) => {
    setCurrentUser(data);
    closeAllPopups();
  })
  .catch((err) => console.log(err))
}
  
function handleUpdateAvatar({avatar}) {
  api.changeAvatar({avatar})
  .then((dataAvatar) => {
    setCurrentUser(dataAvatar);
    closeAllPopups();
  })
  .catch((err) => console.log(err))
}

function handleAddPlaceSubmit({name, link}) {
  api.addCard({name, link})
  .then((newCards) => {
    setCards([newCards, ...cards])
    closeAllPopups();
  })
  .catch((err) => console.log(err))
}

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__container">
        <Header />

        <Main
          onAddPlace={handleAddPlaceClick}
          onEditProfile={handleEditProfileClick}
          onEditAvatar={handleEditAvatarClick}
          onConfirm={handleConfirmClick}
          onCardClick={handleCardClick}
          cards={cards}
          onCardLike={handleCardLike}
          onCardDelete={handleCardDelete}
        />

        <Footer />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
        />

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
        />

        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
        />

        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups}
        />

        <ConfirmPopup
          isOpen={isConfirmPopupOpen}
          onClose={closeAllPopups}
        />

        <PopupWithForm />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
