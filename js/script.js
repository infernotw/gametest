'use strict';

class Table {
   /**
    * полученные аргументы из new Table
    * @param {Object} options
    * arrayNumbers @type {number[]} - массив с числами
    * chosenArr @type {number[]} - выбранный размер поля
    */
   constructor(options) {
      this._settings = { ...options };

      // копирование массива с числами
      this._arrayNumbers = [...this._settings.arrayNumbers];
      // объект, внутрь которого будут записаны массивы
      this._stringDataObj = this._settings.stringDataObj ? { ...this._settings.stringDataObj } : {};
      // ID пустой клетки по горизонтали
      this._ei = null;
      // ID пустой клетки по вертикали
      this._ej = null;
      // корень количества элементов массива
      this._arrSqrt = null;
      // количество прошедшего времени
      this._timeCount = 0;
      // первый запуск игры
      this._isFirstStart = true;
      // счетчик времени
      this._timerInterval = null;
      // количество прошедших минут
      this._timeMin = 0;
      // размер маленького поля
      this._smallField = 9;
      // размер среднего поля
      this._mediumField = 16;
      // размер большого поля
      this._largeField = 25;
      // получение изначально выбранного размера поля
      this._chosenArr = this._arrayNumbers.slice();
      this._chosenArr.splice(this._smallField - 1, this._arrayNumbers.length - this._smallField);

      this._initConst();
      this._initEvt();
      this._startNewGame();
   }

   /**
    * выбор размера поля
    * @param {Object} evt 
    */
   _selectFieldSize(evt) {
      const target = evt.target;

      // копируем массив, чтобы он при каждом изменении был максимальной длины
      this._chosenArr = this._arrayNumbers.slice();

      // в зависимости от выбора режем массив
      switch (target.value) {
         case 'first':
            // поле 3х3
            this._chosenArr.splice(this._smallField - 1, this._arrayNumbers.length - this._smallField);
            this._startNewGame();
            return this._chosenArr;
         case 'second':
            // поле 4х4
            this._chosenArr.splice(this._mediumField - 1, this._arrayNumbers.length - this._mediumField);
            this._startNewGame();
            return this._chosenArr;
         case 'third':
            // поле 5х5
            this._startNewGame();
            return this._chosenArr;
      }
   }

   /**
    * проверка массив на правильное количество элементов
    */
   _checkSuccessArr() {
      let sourceSqrt;
      const
         sourceLength = this._arrayNumbers.length,
         arrLength = this._chosenArr.length;


      // получение корня всего массива
      sourceSqrt = Math.sqrt(sourceLength);
      // получение корня выбранного поля
      this._arrSqrt = Math.sqrt(arrLength);

      // если изначальный массив не удовлетворяет условиям, то выдаю ошибку
      if ((sourceSqrt ^ 0) === sourceSqrt && !(sourceSqrt % 1)) {
         return true;
      }
   }

   /**
    * перемешиваю изначальный массив данных
    * @returns {Array}
    */
   _shuffleArray() {
      let
         j,
         temp;

      for (let i = this._chosenArr.length - 1; i > 0; i--) {
         j = Math.floor(Math.random() * (i + 1));
         temp = this._chosenArr[j];
         this._chosenArr[j] = this._chosenArr[i];
         this._chosenArr[i] = temp;
      }

      return this._chosenArr;
   }

   /**
    * делаю из массива объект с массивами
    * созадю поле, согласно arrSqrt
    */
   _getStringData() {
      let
         stringArr = [],
         stringNumber = 0;

      // заполняю массив
      this._chosenArr.forEach(el => {
         stringArr.push(el);

         // если длина полученного массива равна arrSqrt,
         // то записываю массив в объект и обнуляю его      
         if (stringArr.length === this._arrSqrt) {
            this._stringDataObj[stringNumber] = stringArr;
            stringNumber++;
            stringArr = [];
         }
      });
   }

   /**
    * создаю игровое поле и отрисовываю данные
    */
   _fillTableBody() {
      let
         tbody,
         row,
         cell;

      // если в одном из заданных массивов не хватает/избыток элементов,
      // то выдаю ошибку
      if (!this._checkSuccessArr()) {
         alert('Неверное количество элементов в массиве');
         return;
      }

      // обнуляю тело поля
      this.body.innerHTML = '';
      this.timer.innerHTML = '0:00';

      tbody = document.createElement('tbody');
      this.body.appendChild(tbody);

      // создаю строчки
      for (let i = 0; i < this._arrSqrt; i++) {
         row = document.createElement('tr');

         tbody.appendChild(row);

         // создаю поля в строчках
         this._stringDataObj[i].forEach((el, j) => {
            cell = document.createElement('td');
            cell.textContent = el;
            // даю каждому полю свой ID, которы будет зависить от положения 
            cell.id = `${i} ${j}`;

            // нахожу ID пустой клетки
            if (!el) {
               this._ei = i;
               this._ej = j;
            }

            row.appendChild(cell);
         });
      }
   }

   /**
    * обработка события по клику на клетки
    * @param {Object} evt 
    */
   _cellClick(evt) {
      const
         target = evt.target,
         // получаю id
         // по горизонтали
         i = target.id.charAt(0),
         // по вертикали
         j = target.id.charAt(2);

      // проверяю нажатую клетку по горизонтали или вертикали,
      // если она находится на той же горизонтали или вертикали и на расстоянии 1 клетки (вправо или влево), то выполняю условие
      if ((i == this._ei && Math.abs(j - this._ej) == 1) || (j == this._ej && Math.abs(i - this._ei) == 1)) {
         document.getElementById(`${this._ei} ${this._ej}`).innerHTML = target.innerHTML;
         this._changeArrOrder(evt);
         target.innerHTML = '';
         // устанавливаю новые значения пустой клетки
         this._ei = i;
         this._ej = j;
      }

      // если после нажатия все клетки в правильной последовательности, то показываю победное сообщение
      this._getWinMessage();
   }

   /**
    * проверка первого нажатия, если игра уже запущена, то таймер снова не запускается
    */
   _bodyClick() {
      if (this._isFirstStart) {
         this._isFirstStart = false;

         // установка таймера
         this._timerInterval = setInterval(this._setTimer.bind(this), 1000);
      }
   }

   /**
    * регулировка таймера, установка отображения на странице
    */
   _setTimer() {
      this._timeCount++;

      const
         // определение секунд без минут
         secMin = this._timeCount - (60 * this._timeMin),
         secString = secMin.toString(),
         secLength = secString.length;

      // устанавливаю отображение чисел на странице
      this._setTimeNumbers(secString, secLength);

      // определяю момент, когда количество секунд будет составлять минуту (60 сек = 1 мин)
      // и отображаю на странице минут:00 секунд
      if (!(this._timeCount % 60)) {
         this._timeMin++;
         this.timer.innerHTML = this._timeMin + ':00';
      }
   }

   /**
    * установка отображения чисел на странице
    * @param {string} secString строка секунд
    * @param {number} secLength длина строки, показывающей секунды
    */
   _setTimeNumbers(secString, secLength) {
      switch (secLength) {
         case 1:
            this.timer.innerHTML = this._timeMin ? this._timeMin + ':0' + secString : '0:0' + secString;
            break;
         case 2:
            this.timer.innerHTML = this._timeMin ? this._timeMin + ':' + secString.slice(0, 1) + secString.slice(1, 2) : '0:' + secString.slice(0, 1) + secString.slice(1, 2);
            break;
      }
   }

   /**
    * обнуление таймера
    */
   _resetTimer() {
      this._timeCount = 0;
      this._timeMin = 0;
      this._isFirstStart = true;
      clearInterval(this._timerInterval);
   }

   /**
    * меняю последовательность элементов после клика в скопированном массиве
    * @param {Object} evt 
    */
   _changeArrOrder(evt) {
      let nullCell;
      const target = evt.target;

      // нахожу индекс пустой клетки в массиве
      this._chosenArr.find((el, i) => {
         if (!el) {
            nullCell = i;
         }
      });

      // меняю положения элементов в массиве
      this._chosenArr.forEach((el, i) => {
         if (el === target.innerHTML) {
            // меняю элемент нажатой клетки на пустую строку
            this._chosenArr[i] = this._chosenArr[nullCell];
            // элемент пустой строки заполняю данными нажатой клетки
            this._chosenArr[nullCell] = target.innerHTML;
         }
      });
   }

   /**
    * условия показа сообщения о победе
    */
   _getWinMessage() {
      // проверяю весь массив, если все цифры соответстуют парвильному порядку, 
      // то показываю alert о победе
      const isDontPass = !!this._chosenArr.find((el, i) => {
         const elNumber = parseInt(el);

         // если elNumber не null или undefinded И не соответствует (индексу + 1), то победу не засчитываю
         if (elNumber && elNumber !== ++i) {
            return true;
         }
      });

      if (!isDontPass) {
         alert('Вы победили! Ваше время:' + ' ' + this.timer.innerHTML);
         // остановка таймера
         clearInterval(this._timerInterval);
      }
   }

   /**
    * начинаю новую игру
    */
   _startNewGame() {
      this._checkSuccessArr();
      this._shuffleArray();
      this._getStringData();
      this._resetTimer();
      this._fillTableBody();
   }

   _initConst() {
      this.body = document.querySelector('.table');
      this.button = document.querySelector('button');
      this.buttonSelect = document.querySelector('select');
      this.timer = document.querySelector('.timer-text');
   }

   _initEvt() {
      this.body.addEventListener('click', this._cellClick.bind(this));
      this.body.addEventListener('click', this._bodyClick.bind(this));
      this.button.addEventListener('click', this._startNewGame.bind(this));
      this.buttonSelect.addEventListener('change', this._selectFieldSize.bind(this));
   }
}

new Table({
   arrayNumbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '']
});