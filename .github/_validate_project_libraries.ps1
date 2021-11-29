# GitHub REST API docs: https://docs.github.com/en/rest/reference/repos
# Contents of .\.git\hooks\pre-push or .\.git\hooks\pre-commit :
#
# #!/bin/sh
# echo 
# exec powershell.exe -ExecutionPolicy RemoteSigned -File '.\.github\<Name of this script>.ps1'
# exit

# Global settings

$ErrorActionPreference = "Stop" # Stop execution on first error

# Variables

$github_url = "https://api.github.com"
$root_dir = (get-item (Split-Path $script:MyInvocation.MyCommand.Path)).FullName # Path to this script
$download_libs_path = "$($root_dir)\..\..\Libs\"
$github_token_path = "$($root_dir)\github.token"
$error_count = 0
$headers = @{}
$github_token = "" # GitHub token; no special grants required and can also be stored in external file at path $github_token_path

# Libraries data

$libraries = @(
    # ex.: @( "repo owner", "repo name", "path to file in repo", "absolute path to local file", "name of the library file for download at $download_libs_path" ),
    @( "cure53", "DOMPurify", "dist/purify.min.js", "$($root_dir)\..\libs\dompurify\purify.min.js", "purify.min.js" ),
    @( "cure53", "DOMPurify", "dist/purify.min.js.map", "$($root_dir)\..\libs\dompurify\purify.min.js.map", "purify.min.js.map" ),
    @( "jquery", "jquery", "dist/jquery.min.js", "$($root_dir)\..\libs\jquery\jquery.min.js", "jquery.min.js" ),
    #@( "jquery", "jquery", "dist/jquery.min.map", "$($root_dir)\..\libs\jquery\jquery.min.map", "jquery.min.map" )
    @( "dummy", "do not remove this line", "keep this line always last", "with this you can easily comment out all the lines above without worrying about last comma", "" )
)

# Functions

function get_tag_file_sha($owner, $repo, $repo_file, $local_file, $download_file_name) {
    # Check if rate limit is not reached
    $rate_limit = Invoke-WebRequest -Uri "$($github_url)/rate_limit" -Headers $headers -UseBasicParsing | ConvertFrom-Json
    #write-host $rate_limit | FT
    if ($rate_limit.resources.core.remaining -lt 4) {
        #write-host $rate_limit.resources.core | FT
        write-host "Rate limit reset time:"
        [System.TimeZoneInfo]::ConvertTimeFromUtc((([System.DateTimeOffset]::FromUnixTimeSeconds($rate_limit.resources.core.reset)).DateTime), [System.TimeZoneInfo]::FindSystemTimeZoneById((Get-WmiObject win32_timezone).StandardName)).ToString()
        write-host "Not enough rate limit, cannot verify file SHA." -foregroundcolor "red" -backgroundcolor "black"
        exit 1
    }

    #write-host "Validating file '$($repo_file)' of owner '$($owner)' and repository '$($repo)' and local file '$($local_file)'."

    # Get list of releases to get latest tag name
    $release_list = Invoke-WebRequest -Uri "$($github_url)/repos/$($owner)/$($repo)/releases" -Headers $headers -UseBasicParsing | ConvertFrom-Json
    #write-host $release_list | FT
    #write-host $release_list[0]
    #write-host $release_list[0].tag_name

    # List all tags to obtain one paired with latest release and get commit SHA
    $tag_list = Invoke-WebRequest -Uri "$($github_url)/repos/$($owner)/$($repo)/tags?per_page=3&page=1" -Headers $headers -UseBasicParsing | ConvertFrom-Json
    foreach ($tag in $tag_list) {
        #write-host $tag
        if ($tag.name -eq $release_list[0].tag_name) {
            # write-host $commit_sha
            $commit_sha = $tag.commit.sha
            break;
        }
    }
    
    if ($commit_sha -ne "" -and $commit_sha -ne $null) {
        # Get file version based on commit SHA to obtain file SHA
        $file_data = Invoke-WebRequest -Uri "$($github_url)/repos/$($owner)/$($repo)/contents/$($repo_file)?ref=$($commit_sha)" -Headers $headers -UseBasicParsing | ConvertFrom-Json
        #write-host $file_data

        if ($file_data.download_url -ne "" -and $file_data.download_url -ne $null) {
            # Download file from GitHub and generate its SHA for comparison
            $local_file_ref = $($local_file).Replace("$($root_dir)\", "")
            $remote_file_sha = (Get-FileHash -InputStream (([System.Net.WebClient]::new()).OpenRead($file_data.download_url)) -Algorithm "SHA256").hash.ToLower()
            $local_file_sha = (Get-FileHash -Path "$($local_file)" -Algorithm "SHA256").hash.ToLower()

            # Perform SHA compare of locally used file with file from repository
            if ($remote_file_sha -eq $local_file_sha -and ($remote_file_sha -ne "" -and $remote_file_sha -ne $null) -and ($local_file_sha -ne "" -and $local_file_sha -ne $null)) {
                #write-host "Files are the same" -foregroundcolor "darkGreen" -backgroundcolor "black"
                write-host "$($local_file_ref): OK; "
                return 0
            } else {
                #write-host "Validating file '$($repo_file)' of owner '$($owner)' and repository '$($repo)' and local file '$($local_file)'."
                #write-host "Tag name: $($release_list[0].tag_name)"
                #write-host "Remote:   $($remote_file_sha)"
                #write-host "Local:    $($local_file_sha)"

                # Download current file version for easy replacement
                ([System.Net.WebClient]::new()).DownloadFile($file_data.download_url, "$($download_libs_path)\$($download_file_name)")
                write-host "$($local_file_ref): FAILED; "
                return 1
            }
        }
    }

    write-host "Validating file '$($repo_file)' of owner '$($owner)' and repository '$($repo)' and local file '$($local_file)'."
    write-host "Unable to compare files." -foregroundcolor "red" -backgroundcolor "black"
    exit 1
}

function load_github_token($default_token) {
    #write-host $github_token_path
    if (Test-Path -Path "$($github_token_path)" -PathType Leaf) {
        $content = [IO.File]::ReadAllText($github_token_path).Trim()
        if ($content -ne "" -and $content -ne $null) {
            write-host "GitHub token was found in external file."
            return $content
        } else {
            return $default_token
        }
    } else {
        return $default_token
    }
}

# Main

$github_token = load_github_token "$($github_token)"
#write-host $github_token

if ($github_token -ne "" -and $github_token -ne $null) {
    $headers.Add("Authorization", "token $($github_token)")
    
    # Check token user
    $user_data = Invoke-WebRequest -Uri "$($github_url)/user" -Headers $headers -UseBasicParsing | ConvertFrom-Json
    #write-host $user_data | FT
    write-host "Token owner: $($user_data.login) ($($user_data.name), $($user_data.id))"
}
if ($github_token -eq "" -or $github_token -eq $null) {
    write-host "GitHub token not found, rate limits may apply."
}

write-host "Root directory: $($root_dir)\"
write-host "@@@@@@@@@@@@@@@@@@@@@@@@"
for ($i=0; $i -lt $libraries.Length; $i++) {
    #write-host $i
    #write-host $libraries[$i]
    if ($libraries[$i][0] -ne "dummy") {
        #write-host "Processing..."
        $error_count += get_tag_file_sha "$($libraries[$i][0])" "$($libraries[$i][1])" "$($libraries[$i][2])" "$($libraries[$i][3])" "$($libraries[$i][4])"
    }
}
write-host "@@@@@@@@@@@@@@@@@@@@@@@@"

if ($error_count -ne "") {
    write-host "!!! Some libraries need updating." -foregroundcolor "red" -backgroundcolor "black"
    write-host "Check '$($download_libs_path)' for downloaded libraries."
    exit 1
} else {
    write-host "All checked libraries are up to date!" -foregroundcolor "darkGreen" -backgroundcolor "black"
    exit 0
}
