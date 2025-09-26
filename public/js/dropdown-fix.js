// Dropdown functionality fix
document.addEventListener('DOMContentLoaded', function() {
    // Ensure all dropdowns work properly
    var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });

    // Fix for profile dropdown specifically
    const profileDropdown = document.getElementById('navbarDropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = bootstrap.Dropdown.getInstance(this);
            if (dropdown) {
                dropdown.toggle();
            }
        });
    }
});
