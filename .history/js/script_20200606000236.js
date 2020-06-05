'use strict';

class Table {
   /**
    * полученные аргументы из new Table
    * @param {Object} options
    * arrayNumbers @type {number[]} - массив с числами
    * stringDataObj @type {Object} - объект, внутрь которого будут записаны массивы
    * ei @type {number} - ID пустой клетки по горизонтали по умолчанию
    * ej @type {number} - ID пустой клетки по вертикали
    * arrSqrt @type {number} - корень количества элементов массива
    * chosenArr @type {number[]} - выбранный размер поля
    */
   constructor(options) {
      this._settings = {
         ...options
      };

      // копирование массива с числами
      this._arrayNumbers = [...this._settings.arrayNumbers];
      // копирование объекта для заполнения массивами
      this._stringDataObj = {
         ...this._settings.stringDataObj
      };
      // изначальное ID положения пустой клетки по горизонтали
      this._ei = this._settings.ei;
      // изначальный ID пустой клетки по вертикали        
      this._ej = this._settings.ej;
      // вычисление корня количества элементов массива
      this._arrSqrt = this._settings.arrSqrt;
      // получение изначально выбранного размера поля
      this._chosenArr = [...this._settings.chosenArr];

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
            this._chosenArr.splice(8, 16);
            this._startNewGame();
            return this._chosenArr;
         case 'second':
            // поле 4х4
            this._chosenArr.splice(15, 9);
            this._startNewGame();
            return this._chosenArr;
         case 'third':
            // поле 5х5
            this._startNewGame();
            return this._chosenArr;
      }
   }

   /**
    * проверка массив на правильное количество элементов (9/16/25)
    */
   _checkSuccessArr() {
      const arrLenght = this._chosenArr.length;

      // получение корня
      this._arrSqrt = Math.sqrt(arrLenght);

      // если деление полученного корня на 3/4/5 будет равно нулю,
      // то массив удовлетворяет требованиям для построеня таблицы
      if (!(this._arrSqrt % 3) || !(this._arrSqrt % 4) || !(this._arrSqrt % 5)) {
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
         stringNumber;

      // заполняю массив
      this._chosenArr.forEach((el, i) => {
         stringArr.push(el);

         // если длина полученного массива равна arrSqrt,
         // то записываю массив в объект и обнуляю его
         if (stringArr.length === this._arrSqrt) {
            // задаю номера строчек, которым соответствует каждый массив
            if (i < this._arrSqrt * 2) {
               stringNumber = i > this._arrSqrt ? 1 : 0;
            } else if (i < this._arrSqrt * 4) {
               stringNumber = i > this._arrSqrt * 3 ? 3 : 2;
            } else {
               stringNumber = 4;
            }

            this._stringDataObj[stringNumber] = stringArr;
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
         alert('Неверное количество элементов в массиве')
      }

      // обнуляю тело поля
      this.body.innerHTML = '';

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
            cell.id = i + ' ' + j;

            // нахожу ID пустой клетки
            if (!el) {
               this._ei = i;
               this._ej = j;
            }

            row.appendChild(cell);
         });
      }

      // нахожу пустую клетку
      this._findClearCell();
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
         document.getElementById(this._ei + ' ' + this._ej).innerHTML = target.innerHTML;
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
      // пробегаю весь массив, если все цифры соответстуют парвильному порядку, 
      // то показываю alert о победе
      const isDontPass = !!this._chosenArr.find((el, i) => {
         const elNumber = parseInt(el);

         // если elNumber не null или undefinded И не соответствует (индексу + 1), то победу не засчитываю
         if (elNumber && elNumber !== ++i) {
            return true;
         }
      });

      if (!isDontPass) {
         alert('Победа!');
      }
   }

   /**
    * начинаю новую игру
    */
   _startNewGame() {
      this._checkSuccessArr();
      this._shuffleArray();
      this._getStringData();
      this._fillTableBody();
   }

   _initConst() {
      this.body = document.querySelector('.table');
      this.button = document.querySelector('button');
      this.buttonSelect = document.querySelector('select');
   }

   _initEvt() {
      this.body.addEventListener('click', this._cellClick.bind(this));
      this.button.addEventListener('click', this._startNewGame.bind(this));
      this.buttonSelect.addEventListener('change', this._selectFieldSize.bind(this));
   }
}

new Table({
   ei: null,
   ej: null,
   stringDataObj: {},
   arrayNumbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', ''],
   arrSqrt: null,
   chosenArr: ['1', '2', '3', '4', '5', '6', '7', '8', '']
});