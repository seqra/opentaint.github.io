plugins {
    java
}

group = "demo.app"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.graalvm.polyglot:polyglot:25.0.2")
    implementation("org.springframework:spring-web:5.3.31")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

tasks.register("printRuntimeClasspath") {
    doLast {
        println(sourceSets.main.get().runtimeClasspath.asPath)
    }
}
