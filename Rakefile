require 'crxmake'
require 'json'

TARGET = 'src'

task :default do
  manifest = File.open("#{TARGET}/manifest.json", 'rb') {|f|
    JSON.parse(f.read)
  }
  name = manifest['name']
  CrxMake.make(
    :ex_dir      => TARGET,
    :pkey_output => "#{name}.pem",
    :crx_output  => "#{name}.crx",
    :ignorefile  => /\.shd$/,
    :ignoredir   => /^\.git$/
  )
end
