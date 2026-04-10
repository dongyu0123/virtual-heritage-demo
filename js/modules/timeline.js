/**
 * 时间轴模块
 */
const Timeline = (() => {
  let slider, progress, yearDisplay, crackStatus, onChange;

  function init(callback) {
    slider = document.getElementById('timelineSlider');
    progress = document.getElementById('timelineProgress');
    yearDisplay = document.getElementById('yearDisplay');
    crackStatus = document.getElementById('crackStatus');
    onChange = callback;

    slider.addEventListener('input', onSlide);
    update(2019);
  }

  function onSlide() {
    const val = parseFloat(slider.value);
    update(val);
    if (onChange) onChange(val);
  }

  function update(year) {
    const yearInt = Math.floor(year);
    const pct = ((year - 2019) / (2024 - 2019)) * 100;

    progress.style.width = pct + '%';
    yearDisplay.textContent = year.toFixed(1) + '年';

    const data = MockData.crackTimeline[yearInt];
    if (data) {
      crackStatus.textContent = data.status;
    }
  }

  function setYear(year) {
    slider.value = year;
    update(year);
    if (onChange) onChange(year);
  }

  return { init, update, setYear };
})();
