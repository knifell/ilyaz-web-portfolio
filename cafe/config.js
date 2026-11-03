window.CAFE = {
  name: 'Лист',
  tagline: 'Еда, ради которой хочется замедлиться.',
  demo: true,
  phone: '', // Публичный контакт кафе не предоставлен.
  whatsapp: '', // Для реального кафе: 996XXXXXXXXX, затем demo: false.
  address: 'Бишкек, проспект Эркиндик, 35',
  mapQuery: 'Erkindik Boulevard Bishkek',
  currency: 'сом',
  deliveryFee: 150,
  freeDeliveryFrom: 1800,
  hours: 'Каждый день · 09:00–23:00',
  menu: [
    {id:'bowl',name:'Боул с лососем',category:'Завтраки',price:420,weight:'320 г',description:'Запечённый лосось, рис, стручковая фасоль и томаты черри с лёгкой заправкой.',image:'hero.jpg',tag:'Любим с первого раза',veg:false,allergens:'Рыба, кунжут'},
    {id:'toast',name:'Завтрак без спешки',category:'Завтраки',price:390,weight:'310 г',description:'Хрустящий тост, яйца, авокадо и свежая зелень. Хороший повод проснуться.',image:'breakfast.jpg',tag:'До 13:00',veg:true,allergens:'Глютен, яйца, молоко'},
    {id:'pasta',name:'Паста с песто',category:'Основное',price:490,weight:'300 г',description:'Паста с базиликовым песто, томатами черри и тёртым пармезаном.',image:'pasta.jpg',tag:'Выбор шефа',veg:true,allergens:'Глютен, молоко, орехи'},
    {id:'burger',name:'Тот самый бургер',category:'Основное',price:550,weight:'380 г',description:'Сочная говядина, чеддер, спелый томат и фирменный соус в мягкой булочке.',image:'burger.jpg',tag:'Хит меню',veg:false,allergens:'Глютен, молоко, яйца'},
    {id:'salad',name:'Салат «Зелёный день»',category:'Салаты',price:360,weight:'260 г',description:'Хрустящие сезонные овощи, микс зелени, авокадо и лёгкая цитрусовая заправка.',image:'salad.jpg',tag:'Легко и свежо',veg:true,allergens:'Уточните состав заправки'},
    {id:'pizza',name:'Пицца из печи',category:'Основное',price:650,weight:'450 г',description:'Тонкое тесто, томатный соус, тягучая моцарелла и ароматный базилик.',image:'pizza.jpg',tag:'На двоих',veg:true,allergens:'Глютен, молоко'},
    {id:'coffee',name:'Капучино',category:'Напитки',price:190,weight:'250 мл',description:'Двойной эспрессо и шелковистая молочная пенка. Ваш маленький перерыв.',image:'coffee.jpg',tag:'К завтраку',veg:true,allergens:'Молоко'},
    {id:'dessert',name:'Ягодное настроение',category:'Десерты',price:290,weight:'180 г',description:'Воздушный сливочный десерт с ягодами и нежной ванильной основой.',image:'dessert.jpg',tag:'Сладкий финал',veg:true,allergens:'Молоко, яйца'}
  ]
};
