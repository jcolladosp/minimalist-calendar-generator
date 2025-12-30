const { jsPDF } = window.jspdf;

let uploadedImage = null;
let uploadedFileName = null;
let holidays = [];
let currentLang = 'es';
let darkMode = false;

const translations = {
  es: {
    title: 'Calendario Minimalista',
    year: 'Año',
    month: 'Mes',
    startDay: 'Semana empieza en',
    holidays: 'Días festivos',
    addBtn: 'Añadir',
    dropText: 'Arrastra una imagen o haz clic aquí',
    downloadBtn: 'Descargar PDF',
    font: 'Fuente',
    fontStyle: 'Estilo',
    months: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    monthsShort: [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ],
    days: ['Domingo', 'Lunes'],
    dayLetters: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  },
  en: {
    title: 'Minimalist Calendar',
    year: 'Year',
    month: 'Month',
    startDay: 'Week starts on',
    holidays: 'Holidays',
    addBtn: 'Add',
    dropText: 'Drop an image or click here',
    downloadBtn: 'Download PDF',
    font: 'Font',
    fontStyle: 'Style',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthsShort: [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ],
    days: ['Sunday', 'Monday'],
    dayLetters: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  },
};

function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  document.getElementById('themeBtn').textContent = darkMode ? '☀️' : '🌙';
}

function setLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.textContent === lang.toUpperCase());
  });

  document.getElementById('title').textContent = t.title;
  document.getElementById('labelYear').textContent = t.year;
  document.getElementById('labelMonth').textContent = t.month;
  document.getElementById('labelStartDay').textContent = t.startDay;
  document.getElementById('labelHolidays').textContent = t.holidays;
  document.getElementById('labelFont').textContent = t.font;
  document.getElementById('labelFontStyle').textContent = t.fontStyle;
  document.getElementById('btnAddHoliday').textContent = t.addBtn;
  document.getElementById('generateBtn').textContent = t.downloadBtn;

  if (!uploadedImage) {
    document.getElementById('dropText').textContent = t.dropText;
  }

  const monthSelect = document.getElementById('month');
  const currentMonth = monthSelect.value;
  monthSelect.innerHTML = t.months
    .map((m, i) => `<option value="${i}">${m}</option>`)
    .join('');
  monthSelect.value = currentMonth;

  const startDaySelect = document.getElementById('startDay');
  const currentStartDay = startDaySelect.value;
  startDaySelect.innerHTML = `
        <option value="0">${t.days[0]}</option>
        <option value="1">${t.days[1]}</option>
    `;
  startDaySelect.value = currentStartDay;
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage = event.target.result;
    uploadedFileName = file.name;
    document.getElementById(
      'preview'
    ).innerHTML = `<img src="${uploadedImage}" alt="Preview">`;
    document.getElementById('dropZone').classList.add('has-file');
    document.getElementById('dropText').textContent = file.name;
    document.getElementById('generateBtn').disabled = false;
  };
  reader.readAsDataURL(file);
}

function addHoliday() {
  const input = document.getElementById('holidayInput');
  const day = parseInt(input.value);
  const month = parseInt(document.getElementById('month').value);
  const daysInMonth = getDaysInMonth(
    parseInt(document.getElementById('year').value),
    month
  );

  if (day >= 1 && day <= daysInMonth && !holidays.includes(day)) {
    holidays.push(day);
    holidays.sort((a, b) => a - b);
    renderHolidays();
  }
  input.value = '';
}

function removeHoliday(day) {
  holidays = holidays.filter((h) => h !== day);
  renderHolidays();
}

function renderHolidays() {
  const list = document.getElementById('holidaysList');
  list.innerHTML = holidays
    .map(
      (day) =>
        `<div class="holiday-tag">${day} <span onclick="removeHoliday(${day})">×</span></div>`
    )
    .join('');
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function generatePDF() {
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const startDay = parseInt(document.getElementById('startDay').value);
  const fontFamily = document.getElementById('fontFamily').value;
  const fontStyle = document.getElementById('fontStyle').value;
  const t = translations[currentLang];

  if (!uploadedImage) return;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  console.log('jsPDF Fuentes disponibles:', pdf.getFontList());

  const pageWidth = 148;
  const pageHeight = 210;
  const margin = 10;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  const img = new Image();
  img.src = uploadedImage;

  const maxImgWidth = pageWidth - 2 * margin;
  const maxImgHeight = 130;
  let imgWidth = maxImgWidth;
  let imgHeight = maxImgHeight;

  const imgAspectRatio = img.width / img.height;
  const containerAspectRatio = maxImgWidth / maxImgHeight;

  if (imgAspectRatio > containerAspectRatio) {
    imgHeight = imgWidth / imgAspectRatio;
  } else {
    imgWidth = imgHeight * imgAspectRatio;
  }

  const imgX = margin + (maxImgWidth - imgWidth) / 2;
  const imgY = margin;

  pdf.addImage(uploadedImage, 'JPEG', imgX, imgY, imgWidth, imgHeight);

  const contentStartY = imgY + imgHeight + 13;

  const cellWidth = 9.5;
  const cellHeight = 8;
  const calendarWidth = 7 * cellWidth;
  const calendarStartX = pageWidth - margin - calendarWidth;
  const calendarStartY = contentStartY;

  const dayLetters = t.dayLetters;
  const dayNames = [];
  for (let i = 0; i < 7; i++) {
    dayNames.push(dayLetters[(startDay + i) % 7]);
  }

  pdf.setFont('Inter_28pt-Medium', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);

  dayNames.forEach((day, i) => {
    pdf.text(
      day,
      calendarStartX + i * cellWidth + cellWidth / 2,
      calendarStartY,
      { align: 'center' }
    );
  });

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const adjustedFirstDay = (firstDay - startDay + 7) % 7;

  pdf.setFontSize(12);

  let row = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (adjustedFirstDay + day - 1) % 7;
    const x = calendarStartX + dayOfWeek * cellWidth + cellWidth / 2;
    const y = calendarStartY + 8 + row * cellHeight;

    const actualDayOfWeek = (startDay + dayOfWeek) % 7;
    const isWeekend = actualDayOfWeek === 0 || actualDayOfWeek === 6;
    const isHoliday = holidays.includes(day);

    if (isHoliday || isWeekend) {
      pdf.setTextColor(180, 80, 80);
    } else {
      pdf.setTextColor(80, 80, 80);
    }

    pdf.text(day.toString(), x, y, { align: 'center' });

    if (dayOfWeek === 6) row++;
  }

  pdf.setFontSize(58);
  pdf.setFont(fontFamily, fontStyle);
  pdf.setTextColor(50, 50, 50);
  // Padding del mes
  pdf.text(t.monthsShort[month], margin, calendarStartY + 11.5, {
    charSpace: 1,
  });

  pdf.save(`${t.monthsShort[month].toLowerCase()}-${year}.pdf`);
}

function updateFontStyles() {
  const fontFamily = document.getElementById('fontFamily').value;
  const fontStyleSelect = document.getElementById('fontStyle');
  const currentStyle = fontStyleSelect.value;

  // Limpiar opciones
  fontStyleSelect.innerHTML = '';

  // Definir estilos disponibles según la fuente
  let availableStyles = [];
  if (fontFamily === 'Inter_28pt-Medium') {
    availableStyles = [{ value: 'normal', label: 'Normal' }];
  } else {
    availableStyles = [
      { value: 'normal', label: 'Normal' },
      { value: 'bold', label: 'Bold' },
      { value: 'italic', label: 'Italic' },
      { value: 'bolditalic', label: 'Bold Italic' },
    ];
  }

  // Añadir opciones
  availableStyles.forEach((style) => {
    const option = document.createElement('option');
    option.value = style.value;
    option.textContent = style.label;
    fontStyleSelect.appendChild(option);
  });

  // Restaurar selección si está disponible
  if (availableStyles.some((s) => s.value === currentStyle)) {
    fontStyleSelect.value = currentStyle;
  } else {
    fontStyleSelect.value = 'normal';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setLanguage('es');
  document.getElementById('startDay').value = '1';
  document.getElementById('month').value = '0';

  // Inicializar estilos de fuente
  updateFontStyles();

  // Listener para cambio de fuente
  document
    .getElementById('fontFamily')
    .addEventListener('change', updateFontStyles);

  const dropZone = document.getElementById('dropZone');
  const imageInput = document.getElementById('imageInput');
  const dropText = document.getElementById('dropText');

  dropZone.addEventListener('click', (e) => {
    if (e.target === dropZone || e.target === dropText) {
      imageInput.click();
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = '#f0f0f0';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = '#fafafa';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = '#fafafa';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  });

  imageInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  document.getElementById('month').addEventListener('change', () => {
    holidays = [];
    renderHolidays();
  });

  document.getElementById('holidayInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHoliday();
    }
  });
});
