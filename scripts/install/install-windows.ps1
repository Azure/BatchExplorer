[Console]::OutputEncoding = [System.Text.Encoding]::UTF8


$root = resolve-path "$PSScriptRoot/../../"
Write-Host "Repository root is $root"

$check = [Char]10004
$cross = [Char]10008
$warningSign = [Char]9888

$summary =  New-Object System.Collections.Generic.List[System.Object]

function add-success([string]$message) {
    $item = @{
        object = "$check $message";
        foreground = "green"
    }
    $summary.Add($item)

    Write-Host @item
}

function add-warning([string]$message) {
    $item = @{
        object = "$warningSign $message";
        foreground = "darkyellow"
    }
    $summary.Add($item)
    Write-Host @item;
}

function add-failure([string]$message) {
    $item = @{
        object = "$cross $message";
        foreground = "red"
    }
    $summary.Add($item)
    Write-Host @item;
    exit(1)
}

function display-summary() {
    Write-Host "`n"
    Write-Host "===================================================="
    Write-Host "                  SUMMARY                           "
    Write-Host "----------------------------------------------------"
    foreach ($item in $summary) {
        Write-Host @item
    }
    Write-Host "===================================================="
}

function confirm-branch() {
    $current_branch = [string](git rev-parse --abbrev-ref HEAD)

    if($current_branch -eq "stable") {
        add-success "Building from stable branch."
    } elseif ($current_branch -eq "master") {
        add-success "Building from master branch."
    } else {
        add-warning "Building from $current_branch branch it might not be stable."
    }
}

function confirm-node-version() {
    $node_download_link = "https://nodejs.org/en/download/current/"

    if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
       add-failure "Node.JS is not installed. Please install node >= 6.9 and add it to the path. $node_download_link"
    }

    $node_version = [string](node --version)
    $node_version_regex = "^v(\d*)\.(\d*)\.(\d*)"

    $match = $node_version | Select-String -Pattern  $node_version_regex;

    if (!$match) {
        Write-Host "Your node version $node_verion is not valid."
        exit(1)
    }

    $major = [int]$match.Matches.Groups[1].Value;
    $minor = [int]$match.Matches.Groups[2].Value;
    $patch = [int]$match.Matches.Groups[3].Value;

    if ($major -lt 5 -or ($major -eq 6 -and $minor -lt 9)) {
        add-failure "You version of node '$node_version' is invalid. Please install node >= 6.9.0. $node_download_Link"
    }

    add-success "Node version '$node_version' is valid";
}

function install-node-dependencies() {
    npm install -g yarn

    Remove-Item -path .\node_modules -recurse -Force
    yarn install --force

    if($?) {
        add-success "Installed dependencies correctly" -foreground "green";
    } else {
        add-failure "Failed to install depdencies"
    }
}


function install-python-dependencies() {
    # pipPath = npm run -s ts .\scripts\install\get-python.ts | Out-String
    $python = [string](npm run -s ts .\scripts\install\get-python.ts)

    Write-Host "Python path is $python"

    if($?) {
        add-success "Python version is valid. Using '$python'" -foreground "green";
    } else {
        add-failure "Invalid version of python installed. Need 3.6. You can either have globably available in the path as python, python3 or set the BL_PYTHON_PATH environment variable."
    }

    Write-Host "$python $root/scripts/install/install-python-dep.py"
    cmd /c "$python $root/scripts/install/install-python-dep.py"

    if($?) {
        add-success "Installed python dependencies correctly" -foreground "green";
    } else {
        add-failure "Failed to install depdencies"
    }
}

function build-batchlabs() {
    npm run build-and-pack

    if($?) {
        add-success "Built the app successfully. Check ${root}release\win-unpacked for the executable" -foreground "green";
    } else {
        add-failure "Failed to build the app."
    }
}

confirm-branch
confirm-node-version
install-node-dependencies
install-python-dependencies
build-batchlabs

display-summary
